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
    if (!rateLimitAllowed($pdo, 'password_change', (string) $user['id'] . ':' . (activityClientIp() ?? 'unknown'), 5, 900)) {
        respond(['success' => false, 'message' => 'Too many password change attempts. Please try again later.'], 429);
    }

    $data = requestData();
    $currentPassword = (string) ($data['current_password'] ?? '');
    $newPassword = (string) ($data['new_password'] ?? '');
    $confirmPassword = (string) ($data['confirm_password'] ?? '');
    $query = $pdo->prepare('SELECT password_hash FROM users WHERE id = :id LIMIT 1');
    $query->execute([':id' => $user['id']]);
    $passwordHash = $query->fetchColumn();

    if (!is_string($passwordHash) || !password_verify($currentPassword, $passwordHash)) {
        accountAudit($pdo, (int) $user['id'], 'password_change_failed');
        respond(['success' => false, 'message' => 'Current password is incorrect.'], 422);
    }
    if (!accountPasswordValid($newPassword)) {
        respond(['success' => false, 'message' => 'Use 12 to 128 characters, including at least one letter and one number.'], 422);
    }
    if ($newPassword !== $confirmPassword) {
        respond(['success' => false, 'message' => 'New password confirmation does not match.'], 422);
    }
    if (password_verify($newPassword, $passwordHash)) {
        respond(['success' => false, 'message' => 'Choose a password different from your current password.'], 422);
    }

    $pdo->beginTransaction();
    $update = $pdo->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :id');
    $update->execute([':password_hash' => password_hash($newPassword, PASSWORD_DEFAULT), ':id' => $user['id']]);
    $currentSession = currentSessionId($pdo);
    $revoke = $pdo->prepare('DELETE FROM auth_sessions WHERE user_id = :user_id AND id <> :current_session');
    $revoke->execute([':user_id' => $user['id'], ':current_session' => $currentSession ?? 0]);
    accountAudit($pdo, (int) $user['id'], 'password_changed');
    $pdo->commit();

    securityEmail($pdo, (int) $user['id'], 'password_changed', 'Your password was changed', 'Your NodeConnect account password was changed. Other signed-in sessions were signed out.');
    respond(['success' => true, 'message' => 'Password changed. Other sessions have been signed out.']);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
