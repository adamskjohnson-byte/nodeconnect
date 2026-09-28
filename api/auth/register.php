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
    establishSession($pdo, $userId);
    $verificationToken = createSingleUseToken($pdo, 'email_verification_tokens', $userId, 86400);
    $userQuery = $pdo->prepare('SELECT id, full_name, email, status, role, email_verified_at, created_at, last_login_at FROM users WHERE id = :id');
    $userQuery->execute([':id' => $userId]);
    $user = $userQuery->fetch();
    $pdo->commit();

    $verificationUrl = frontendUrl('#auth?mode=verify-email&token=' . rawurlencode($verificationToken));
    $emailSent = actionEmail($email, $fullName, 'Verify your NodeConnect email', 'Confirm your email address using the link below. This link expires in 24 hours. Email verification does not block sign-in.', $verificationUrl, 'Verify email');
    unset($verificationToken, $verificationUrl, $password, $confirmPassword);
    if ($emailSent) {
        accountAudit($pdo, $userId, 'email_verification_sent');
    } else {
        error_log('NodeConnect registration verification email delivery failed.');
    }

    respond(['success' => true, 'message' => $emailSent ? 'Account created. Check your email to verify your address.' : 'Account created, but the verification email could not be sent. You can request another from Settings.', 'verification_email_sent' => $emailSent, 'user' => safeUser($user)], 201);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
