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
    $email = strtolower(trim((string) ($data['email'] ?? '')));
    $ip = activityClientIp() ?? 'unknown';
    if (!rateLimitAllowed($pdo, 'password_reset_request_ip', $ip, 20, 3600)
        || !rateLimitAllowed($pdo, 'password_reset_request_email', $email, 5, 3600)) {
        respond(['success' => true, 'message' => 'If an account exists and email delivery is available, a reset link will be sent.']);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(['success' => true, 'message' => 'If an account exists and email delivery is available, a reset link will be sent.']);
    }

    $statement = $pdo->prepare('SELECT id, full_name, email FROM users WHERE email = :email AND status = \'active\' LIMIT 1');
    $statement->execute([':email' => $email]);
    $user = $statement->fetch();
    if ($user) {
        $token = createSingleUseToken($pdo, 'password_reset_tokens', (int) $user['id'], 3600);
        accountAudit($pdo, (int) $user['id'], 'password_reset_requested');
        $url = frontendUrl('#auth?mode=reset-password&token=' . rawurlencode($token));
        actionEmail((string) $user['email'], (string) $user['full_name'], 'Reset your NodeConnect password', 'A password reset was requested for your account. This link expires in one hour.', $url, 'Reset password');
        unset($token, $url);
    }
    respond(['success' => true, 'message' => 'If an account exists and email delivery is available, a reset link will be sent.']);
} catch (Throwable $error) {
    handleServerError($error);
}
