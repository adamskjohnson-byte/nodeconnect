<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/account_support.php';

if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', ['GET', 'POST'], true)) {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $pdo = database();
    $user = requireUser($pdo);
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        requireTrustedOrigin();
        $data = requestData();
        $fullName = trim((string) ($data['full_name'] ?? ''));
        if ($fullName === '' || mb_strlen($fullName) > 150) {
            respond(['success' => false, 'message' => 'Enter a name between 1 and 150 characters.'], 422);
        }
        $pdo->beginTransaction();
        $statement = $pdo->prepare('UPDATE users SET full_name = :full_name WHERE id = :user_id AND status = \'active\'');
        $statement->execute([':full_name' => $fullName, ':user_id' => $user['id']]);
        accountAudit($pdo, (int) $user['id'], 'profile_updated');
        $statement = $pdo->prepare('SELECT id, full_name, email, status, role, email_verified_at, created_at, last_login_at FROM users WHERE id = :id LIMIT 1');
        $statement->execute([':id' => $user['id']]);
        $updatedUser = $statement->fetch();
        $pdo->commit();
        respond(['success' => true, 'user' => safeUser($updatedUser)]);
    }

    respond(['success' => true, 'user' => safeUser($user)]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
