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
    $email = strtolower(trim((string) ($data['email'] ?? '')));
    $password = (string) ($data['password'] ?? '');

    $ip = activityClientIp() ?? 'unknown';
    if (!rateLimitAllowed(database(), 'login_ip', $ip, 30, 900)
        || !rateLimitAllowed(database(), 'login_email', $email, 12, 900)) {
        respond(['success' => false, 'message' => 'Too many sign-in attempts. Please try again later.'], 429);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
        respond(['success' => false, 'message' => 'Invalid email or password.'], 422);
    }

    $pdo = database();
    $statement = $pdo->prepare('SELECT id, full_name, email, password_hash, status, role, email_verified_at, created_at, last_login_at FROM users WHERE email = :email LIMIT 1');
    $statement->execute([':email' => $email]);
    $user = $statement->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        respond(['success' => false, 'message' => 'Invalid email or password.'], 401);
    }
    if ($user['status'] !== 'active') {
        respond(['success' => false, 'message' => 'Your account is currently unavailable.'], 403);
    }
    if (empty($user['email_verified_at'])) {
        $pdo->prepare('DELETE FROM auth_sessions WHERE user_id = :user_id')->execute([':user_id' => $user['id']]);
        $pdo->prepare('DELETE FROM auth_login_challenges WHERE user_id = :user_id')->execute([':user_id' => $user['id']]);
        clearCurrentSession($pdo);
        setcookie('nodeconnect_2fa_challenge', '', sessionCookieOptions(time() - 3600));
        $verificationEmailSent = issueEmailVerificationOtp($pdo, $user);
        unset($password, $user['password_hash']);
        respond(['success' => false, 'code' => 'EMAIL_NOT_VERIFIED', 'verification_email_sent' => $verificationEmailSent, 'message' => 'Verify your email address before signing in.'], 403);
    }

    $twoFactor = $pdo->prepare('SELECT enabled_at FROM user_two_factor WHERE user_id = :user_id LIMIT 1');
    $twoFactor->execute([':user_id' => $user['id']]);
    if ($twoFactor->fetchColumn()) {
        clearCurrentSession($pdo);
        $challengeToken = bin2hex(random_bytes(32));
        $challengeHash = hash('sha256', $challengeToken);
        $pdo->prepare('DELETE FROM auth_login_challenges WHERE user_id = :user_id OR expires_at <= CURRENT_TIMESTAMP')->execute([':user_id' => $user['id']]);
        $challenge = $pdo->prepare('INSERT INTO auth_login_challenges (user_id, challenge_token_hash, expires_at) VALUES (:user_id, :token_hash, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 5 MINUTE))');
        $challenge->execute([':user_id' => $user['id'], ':token_hash' => $challengeHash]);
        setcookie('nodeconnect_2fa_challenge', $challengeToken, sessionCookieOptions(time() + 300));
        unset($challengeToken, $password);
        respond(['success' => true, 'requires_2fa' => true, 'message' => 'Enter your authenticator or recovery code.']);
    }

    $pdo->beginTransaction();
    $update = $pdo->prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = :id');
    $update->execute([':id' => $user['id']]);
    establishSession($pdo, (int) $user['id']);
    logActivity($pdo, (int) $user['id'], 'login_success');
    $pdo->commit();

    $user['last_login_at'] = (new DateTimeImmutable())->format('Y-m-d H:i:s');
    unset($user['password_hash']);
    sendWelcomeEmailIfNeeded($pdo, (int) $user['id']);
    respond(['success' => true, 'message' => 'Signed in successfully.', 'user' => safeUser($user)]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
