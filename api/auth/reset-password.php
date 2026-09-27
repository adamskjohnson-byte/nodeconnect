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
    $token = (string) ($data['token'] ?? '');
    $password = (string) ($data['new_password'] ?? '');
    $confirmation = (string) ($data['confirm_password'] ?? '');
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
        respond(['success' => false, 'message' => 'This password reset link is invalid or expired.'], 422);
    }
    if (!accountPasswordValid($password)) {
        respond(['success' => false, 'message' => 'Use 12 to 128 characters, including at least one letter and one number.'], 422);
    }
    if ($password !== $confirmation) {
        respond(['success' => false, 'message' => 'Password confirmation does not match.'], 422);
    }
    if (!rateLimitAllowed($pdo, 'password_reset_complete', activityClientIp() ?? 'unknown', 10, 3600)) {
        respond(['success' => false, 'message' => 'Too many reset attempts. Please try again later.'], 429);
    }

    $pdo->beginTransaction();
    $statement = $pdo->prepare('SELECT id, user_id FROM password_reset_tokens WHERE token_hash = :token_hash AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP LIMIT 1 FOR UPDATE');
    $statement->execute([':token_hash' => hash('sha256', $token)]);
    $tokenRow = $statement->fetch();
    if (!$tokenRow) {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'This password reset link is invalid or expired.'], 422);
    }
    $userId = (int) $tokenRow['user_id'];
    $update = $pdo->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :id AND status = \'active\'');
    $update->execute([':password_hash' => password_hash($password, PASSWORD_DEFAULT), ':id' => $userId]);
    if ($update->rowCount() !== 1) {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'This password reset link is invalid or expired.'], 422);
    }
    $pdo->prepare('UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = :id')->execute([':id' => $tokenRow['id']]);
    $pdo->prepare('DELETE FROM auth_sessions WHERE user_id = :user_id')->execute([':user_id' => $userId]);
    accountAudit($pdo, $userId, 'password_reset_completed');
    $pdo->commit();
    setcookie(AUTH_COOKIE, '', sessionCookieOptions(time() - 3600));

    securityEmail($pdo, $userId, 'password_reset_completed', 'Your password was reset', 'The password for your NodeConnect account was reset. All signed-in sessions were revoked.');
    unset($token, $password, $confirmation);
    respond(['success' => true, 'message' => 'Password reset. Sign in with your new password.']);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
