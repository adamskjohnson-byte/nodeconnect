<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/account_support.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    requireTrustedOrigin();
    $pdo = database();
    $data = requestData();
    if (array_key_exists('email', $data) || array_key_exists('code', $data)) {
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $code = trim((string) ($data['code'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{6}$/', $code)) {
            respond(['success' => false, 'message' => 'This verification code is invalid or expired.'], 422);
        }
        if (!rateLimitAllowed($pdo, 'email_verification_otp_ip', activityClientIp() ?? 'unknown', 20, 900)) {
            respond(['success' => false, 'message' => 'Too many verification attempts. Please try again later.'], 429);
        }
        $accountQuery = $pdo->prepare('SELECT id, status FROM users WHERE email = :email LIMIT 1');
        $accountQuery->execute([':email' => $email]);
        $account = $accountQuery->fetch();
        if (!$account || $account['status'] !== 'active') {
            unset($code);
            respond(['success' => false, 'message' => 'This verification code is invalid or expired.'], 422);
        }
        $userId = (int) $account['id'];
        if (!rateLimitAllowed($pdo, 'email_verification_otp_user', (string) $userId, 5, 900, 900)) {
            unset($code);
            respond(['success' => false, 'message' => 'Too many verification attempts. Please request a new code later.'], 429);
        }

        $pdo->beginTransaction();
        $otpQuery = $pdo->prepare(
            'SELECT id, token_hash FROM email_verification_tokens
             WHERE user_id = :user_id AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
             ORDER BY id DESC LIMIT 1 FOR UPDATE'
        );
        $otpQuery->execute([':user_id' => $userId]);
        $otp = $otpQuery->fetch();
        $expectedHash = hash_hmac('sha256', 'email-verification-otp:v1:' . $userId . ':' . $code, accountRateLimitKey());
        unset($code);
        if (!$otp || !hash_equals((string) $otp['token_hash'], $expectedHash)) {
            accountAudit($pdo, $userId, 'email_verification_code_failed');
            $pdo->commit();
            respond(['success' => false, 'message' => 'This verification code is invalid or expired.'], 422);
        }

        $pdo->prepare('UPDATE users SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP) WHERE id = :id')->execute([':id' => $userId]);
        $pdo->prepare('UPDATE email_verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = :user_id AND used_at IS NULL')->execute([':user_id' => $userId]);
        $pdo->prepare('DELETE FROM auth_sessions WHERE user_id = :user_id')->execute([':user_id' => $userId]);
        $pdo->prepare('DELETE FROM auth_login_challenges WHERE user_id = :user_id')->execute([':user_id' => $userId]);
        accountAudit($pdo, $userId, 'email_verified', ['method' => 'otp']);
        $pdo->commit();
        respond(['success' => true, 'message' => 'Email address verified.']);
    }

    $token = (string) ($data['token'] ?? '');
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
        respond(['success' => false, 'message' => 'This verification link is invalid or expired.'], 422);
    }
    if (!rateLimitAllowed($pdo, 'email_verification', activityClientIp() ?? 'unknown', 20, 3600)) {
        respond(['success' => false, 'message' => 'Too many verification attempts. Please try again later.'], 429);
    }

    $pdo->beginTransaction();
    $statement = $pdo->prepare('SELECT id, user_id FROM email_verification_tokens WHERE token_hash = :token_hash AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP LIMIT 1 FOR UPDATE');
    $statement->execute([':token_hash' => hash('sha256', $token)]);
    $row = $statement->fetch();
    if (!$row) {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'This verification link is invalid or expired.'], 422);
    }
    $pdo->prepare('UPDATE users SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP) WHERE id = :id')->execute([':id' => $row['user_id']]);
    $pdo->prepare('UPDATE email_verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = :id')->execute([':id' => $row['id']]);
    $pdo->prepare('DELETE FROM auth_sessions WHERE user_id = :user_id')->execute([':user_id' => $row['user_id']]);
    $pdo->prepare('DELETE FROM auth_login_challenges WHERE user_id = :user_id')->execute([':user_id' => $row['user_id']]);
    accountAudit($pdo, (int) $row['user_id'], 'email_verified');
    $pdo->commit();
    unset($token);
    respond(['success' => true, 'message' => 'Email address verified.']);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
