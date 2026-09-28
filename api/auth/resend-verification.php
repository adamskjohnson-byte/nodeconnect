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
    if (array_key_exists('email', $data)) {
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $email = substr($email, 0, 255);
        $ipAllowed = rateLimitAllowed($pdo, 'verification_otp_public_ip', activityClientIp() ?? 'unknown', 10, 3600);
        $emailAllowed = filter_var($email, FILTER_VALIDATE_EMAIL)
            && rateLimitAllowed($pdo, 'verification_otp_send_email', $email, 1, 60, 60)
            && rateLimitAllowed($pdo, 'verification_otp_email_hourly', $email, 5, 3600);
        if ($ipAllowed && $emailAllowed) {
            $lookup = $pdo->prepare('SELECT id, email, full_name, email_verified_at FROM users WHERE email = :email LIMIT 1');
            $lookup->execute([':email' => $email]);
            $account = $lookup->fetch();
            if ($account && empty($account['email_verified_at'])) {
                issueEmailVerificationOtp($pdo, $account, false);
            }
        }
        respond(['success' => true, 'message' => 'If this account needs verification, a new code will be sent shortly.']);
    }

    $user = requireUser($pdo);
    if (!rateLimitAllowed($pdo, 'verification_resend', (string) $user['id'], 3, 3600)) {
        respond(['success' => false, 'message' => 'A verification email cannot be sent right now. Please try later.'], 429);
    }
    if (!empty($user['email_verified_at'])) {
        respond(['success' => true, 'message' => 'This email address is already verified.']);
    }
    $token = createSingleUseToken($pdo, 'email_verification_tokens', (int) $user['id'], 86400);
    $tokenHash = hash('sha256', $token);
    $url = frontendUrl('#auth?mode=verify-email&token=' . rawurlencode($token));
    $sent = actionEmail((string) $user['email'], (string) $user['full_name'], 'Verify your NodeConnect email', 'Confirm your email address using the link below. This link expires in 24 hours.', $url, 'Verify email');
    unset($token, $url);
    if (!$sent) {
        $pdo->prepare('UPDATE email_verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = :user_id AND token_hash = :token_hash AND used_at IS NULL')
            ->execute([':user_id' => $user['id'], ':token_hash' => $tokenHash]);
        accountAudit($pdo, (int) $user['id'], 'email_verification_delivery_failed', ['method' => 'link']);
        respond(['success' => false, 'message' => 'The verification email could not be sent. Please try again later.'], 503);
    }
    accountAudit($pdo, (int) $user['id'], 'email_verification_sent', ['method' => 'link']);
    respond(['success' => true, 'message' => 'Verification email sent.']);
} catch (Throwable $error) {
    handleServerError($error);
}
