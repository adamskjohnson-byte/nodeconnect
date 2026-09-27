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
    if (!rateLimitAllowed($pdo, 'account_deactivation', (string) $user['id'], 3, 3600)) {
        respond(['success' => false, 'message' => 'Too many deactivation attempts. Please try again later.'], 429);
    }
    $data = requestData();
    if (($data['confirmation'] ?? '') !== 'DEACTIVATE') {
        respond(['success' => false, 'message' => 'Type DEACTIVATE to confirm account deactivation.'], 422);
    }
    $passwordQuery = $pdo->prepare('SELECT password_hash FROM users WHERE id = :id LIMIT 1');
    $passwordQuery->execute([':id' => $user['id']]);
    if (!password_verify((string) ($data['password'] ?? ''), (string) $passwordQuery->fetchColumn())) {
        respond(['success' => false, 'message' => 'Password confirmation is incorrect.'], 422);
    }

    $pdo->beginTransaction();
    $pdo->prepare('UPDATE users SET status = \'disabled\', deactivated_at = CURRENT_TIMESTAMP WHERE id = :id')->execute([':id' => $user['id']]);
    accountAudit($pdo, (int) $user['id'], 'account_deactivated');
    $pdo->prepare('DELETE FROM auth_sessions WHERE user_id = :user_id')->execute([':user_id' => $user['id']]);
    $pdo->commit();
    setcookie(AUTH_COOKIE, '', sessionCookieOptions(time() - 3600));
    securityEmail($pdo, (int) $user['id'], 'account_deactivated', 'Your NodeConnect account was deactivated', 'Your account was deactivated and its active sessions were signed out. Existing records are retained.');
    respond(['success' => true, 'message' => 'Account deactivated.']);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
