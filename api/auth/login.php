<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $data = requestData();
    $email = strtolower(trim((string) ($data['email'] ?? '')));
    $password = (string) ($data['password'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        respond(['success' => false, 'message' => 'Invalid email or password.'], 422);
    }

    $pdo = database();
    $statement = $pdo->prepare('SELECT id, full_name, email, password_hash, status, role, created_at, last_login_at FROM users WHERE email = :email LIMIT 1');
    $statement->execute([':email' => $email]);
    $user = $statement->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        respond(['success' => false, 'message' => 'Invalid email or password.'], 401);
    }
    if ($user['status'] !== 'active') {
        respond(['success' => false, 'message' => 'Your account is currently unavailable.'], 403);
    }

    $pdo->beginTransaction();
    $update = $pdo->prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = :id');
    $update->execute([':id' => $user['id']]);
    establishSession($pdo, (int) $user['id']);
    logActivity($pdo, (int) $user['id'], 'login_success');
    $pdo->commit();

    $user['last_login_at'] = (new DateTimeImmutable())->format('Y-m-d H:i:s');
    unset($user['password_hash']);
    respond(['success' => true, 'message' => 'Signed in successfully.', 'user' => safeUser($user)]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
