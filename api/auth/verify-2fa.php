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
    $challengeToken = $_COOKIE['nodeconnect_2fa_challenge'] ?? '';
    if (!is_string($challengeToken) || !preg_match('/^[a-f0-9]{64}$/', $challengeToken)) {
        respond(['success' => false, 'message' => 'Sign-in challenge expired. Please sign in again.'], 401);
    }
    $data = requestData();
    $code = trim((string) ($data['code'] ?? ''));
    if (!rateLimitAllowed($pdo, 'login_2fa_ip', activityClientIp() ?? 'unknown', 12, 900)) {
        respond(['success' => false, 'message' => 'Too many verification attempts. Please sign in again later.'], 429);
    }

    $pdo->beginTransaction();
    $statement = $pdo->prepare(
        'SELECT c.id AS challenge_id, c.user_id, c.attempts, u.full_name, u.email, u.status, u.role, u.email_verified_at, u.created_at, u.last_login_at,
                f.secret_encrypted, f.last_totp_timestamp
         FROM auth_login_challenges c
         INNER JOIN users u ON u.id = c.user_id
         INNER JOIN user_two_factor f ON f.user_id = c.user_id AND f.enabled_at IS NOT NULL
         WHERE c.challenge_token_hash = :token_hash AND c.expires_at > CURRENT_TIMESTAMP
         LIMIT 1 FOR UPDATE'
    );
    $statement->execute([':token_hash' => hash('sha256', $challengeToken)]);
    $challenge = $statement->fetch();
    if (!$challenge || $challenge['status'] !== 'active' || (int) $challenge['attempts'] >= 5) {
        if ($challenge) {
            $pdo->prepare('DELETE FROM auth_login_challenges WHERE id = :id')->execute([':id' => $challenge['challenge_id']]);
        }
        $pdo->commit();
        setcookie('nodeconnect_2fa_challenge', '', sessionCookieOptions(time() - 3600));
        respond(['success' => false, 'message' => 'Sign-in challenge expired. Please sign in again.'], 401);
    }

    $google2fa = new PragmaRX\Google2FA\Google2FA();
    $secret = decryptAccountSecret((string) $challenge['secret_encrypted']);
    $isRecovery = !preg_match('/^\d{6}$/', $code);
    $verifiedTimestamp = $isRecovery ? false : $google2fa->verifyKeyNewer($secret, $code, $challenge['last_totp_timestamp'] === null ? 0 : (int) $challenge['last_totp_timestamp'], 1);
    $verified = $isRecovery
        ? consumeRecoveryCode($pdo, (int) $challenge['user_id'], $code)
        : ($verifiedTimestamp !== false);
    unset($secret, $code);

    if (!$verified) {
        $pdo->prepare('UPDATE auth_login_challenges SET attempts = attempts + 1 WHERE id = :id')->execute([':id' => $challenge['challenge_id']]);
        $pdo->commit();
        respond(['success' => false, 'message' => 'The authenticator or recovery code is invalid.'], 422);
    }

    $pdo->prepare('DELETE FROM auth_login_challenges WHERE id = :id')->execute([':id' => $challenge['challenge_id']]);
    if (!$isRecovery) {
        $pdo->prepare('UPDATE user_two_factor SET last_used_at = CURRENT_TIMESTAMP, last_totp_timestamp = :timestamp WHERE user_id = :user_id')->execute([':timestamp' => $verifiedTimestamp, ':user_id' => $challenge['user_id']]);
    } else {
        accountAudit($pdo, (int) $challenge['user_id'], 'recovery_code_used');
    }
    $pdo->prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = :id')->execute([':id' => $challenge['user_id']]);
    establishSession($pdo, (int) $challenge['user_id']);
    logActivity($pdo, (int) $challenge['user_id'], 'login_success');
    $pdo->commit();
    setcookie('nodeconnect_2fa_challenge', '', sessionCookieOptions(time() - 3600));

    $challenge['last_login_at'] = (new DateTimeImmutable())->format('Y-m-d H:i:s');
    respond(['success' => true, 'message' => 'Signed in successfully.', 'user' => safeUser($challenge)]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
