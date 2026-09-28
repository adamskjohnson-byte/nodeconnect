<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/account_support.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    requireTrustedOrigin();
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
    if (!accountPasswordValid($password)) {
        respond(['success' => false, 'message' => 'Use 12 to 128 characters, including at least one letter and one number.'], 422);
    }
    if ($password !== $confirmPassword) {
        respond(['success' => false, 'message' => 'Passwords do not match.'], 422);
    }

    $pdo = database();
    if (!rateLimitAllowed($pdo, 'registration_ip', activityClientIp() ?? 'unknown', 15, 3600)
        || !rateLimitAllowed($pdo, 'registration_email', $email, 3, 3600)) {
        respond(['success' => false, 'message' => 'Too many account creation attempts. Please try again later.'], 429);
    }
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
    ensureReferralId($pdo, $userId);
    $userQuery = $pdo->prepare('SELECT id, full_name, email, status, role, email_verified_at, created_at, last_login_at FROM users WHERE id = :id');
    $userQuery->execute([':id' => $userId]);
    $user = $userQuery->fetch();
    $pdo->commit();

    $emailSent = issueEmailVerificationOtp($pdo, $user);
    unset($password, $confirmPassword, $user);

    respond(['success' => true, 'message' => 'Account created. Email verification is required before sign-in.', 'verification_required' => true, 'verification_email_sent' => $emailSent], 201);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
