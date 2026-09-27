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
    $user = requireUser($pdo);
    if (!rateLimitAllowed($pdo, 'verification_resend', (string) $user['id'], 3, 3600)) {
        respond(['success' => false, 'message' => 'A verification email cannot be sent right now. Please try later.'], 429);
    }
    if (!empty($user['email_verified_at'])) {
        respond(['success' => true, 'message' => 'This email address is already verified.']);
    }
    $token = createSingleUseToken($pdo, 'email_verification_tokens', (int) $user['id'], 86400);
    accountAudit($pdo, (int) $user['id'], 'email_verification_sent');
    $url = frontendUrl('#auth?mode=verify-email&token=' . rawurlencode($token));
    $sent = actionEmail((string) $user['email'], (string) $user['full_name'], 'Verify your NodeConnect email', 'Confirm your email address using the link below. This link expires in 24 hours.', $url, 'Verify email');
    unset($token, $url);
    if (!$sent) {
        respond(['success' => false, 'message' => 'The verification email could not be sent. Please try again later.'], 503);
    }
    respond(['success' => true, 'message' => 'Verification email sent.']);
} catch (Throwable $error) {
    handleServerError($error);
}
