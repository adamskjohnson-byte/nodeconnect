<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $data = requestData();
    $fullName = trim((string) ($data['full_name'] ?? ''));
    $email = strtolower(trim((string) ($data['email'] ?? '')));
    $password = (string) ($data['password'] ?? '');
    $confirmPassword = (string) ($data['confirm_password'] ?? '');

    if ($fullName === '' || mb_strlen($fullName) > 150) {
        respond(['success' => false, 'message' => 'Please enter your full name.'], 422);
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
        respond(['success' => false, 'message' => 'Please enter a valid email address.'], 422);
    }
    if (strlen($password) < 8) {
        respond(['success' => false, 'message' => 'Password must be at least 8 characters.'], 422);
    }
    if ($password !== $confirmPassword) {
        respond(['success' => false, 'message' => 'Passwords do not match.'], 422);
    }

    $pdo = database();
    $existing = $pdo->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $existing->execute([':email' => $email]);
    if ($existing->fetch()) {
        respond(['success' => false, 'message' => 'An account with this email already exists.'], 409);
    }

    $pdo->beginTransaction();
    $statement = $pdo->prepare('INSERT INTO users (full_name, email, password_hash) VALUES (:full_name, :email, :password_hash)');
    $statement->execute([
        ':full_name' => $fullName,
        ':email' => $email,
        ':password_hash' => password_hash($password, PASSWORD_DEFAULT),
    ]);
    $userId = (int) $pdo->lastInsertId();
    establishSession($pdo, $userId);
    $userQuery = $pdo->prepare('SELECT id, full_name, email, status, role, created_at, last_login_at FROM users WHERE id = :id');
    $userQuery->execute([':id' => $userId]);
    $user = $userQuery->fetch();
    $pdo->commit();

    respond(['success' => true, 'message' => 'Account created successfully.', 'user' => safeUser($user)], 201);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
