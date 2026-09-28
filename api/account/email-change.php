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
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
        $statement = $pdo->prepare('SELECT new_email, expires_at FROM email_change_requests WHERE user_id = :user_id AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP LIMIT 1');
        $statement->execute([':user_id' => $user['id']]);
        $pending = $statement->fetch();
        respond(['success' => true, 'pending_email' => $pending['new_email'] ?? null, 'expires_at' => $pending['expires_at'] ?? null]);
    }
    requireTrustedOrigin();
    $scope = (string) $user['id'] . ':' . (activityClientIp() ?? 'unknown');
    if (!rateLimitAllowed($pdo, 'email_change_request', $scope, 4, 3600)) {
        respond(['success' => false, 'message' => 'Too many email change requests. Please try again later.'], 429);
    }

    $data = requestData();
    $newEmail = strtolower(trim((string) ($data['new_email'] ?? '')));
    $password = (string) ($data['password'] ?? '');
    if (!filter_var($newEmail, FILTER_VALIDATE_EMAIL) || strlen($newEmail) > 255) {
        respond(['success' => false, 'message' => 'Enter a valid email address.'], 422);
    }

    $passwordQuery = $pdo->prepare('SELECT password_hash, email, full_name FROM users WHERE id = :id LIMIT 1');
    $passwordQuery->execute([':id' => $user['id']]);
    $account = $passwordQuery->fetch();
    if (!$account || !password_verify($password, (string) $account['password_hash'])) {
        accountAudit($pdo, (int) $user['id'], 'email_change_request_failed');
        respond(['success' => false, 'message' => 'Password confirmation is incorrect.'], 422);
    }
    unset($password);

    $genericMessage = 'If this address is available, a confirmation link will be sent shortly.';
    if (strcasecmp($newEmail, (string) $account['email']) === 0) {
        respond(['success' => true, 'message' => $genericMessage]);
    }

    $pdo->beginTransaction();
    $existing = $pdo->prepare('SELECT id FROM users WHERE email = :email AND id <> :user_id LIMIT 1 FOR UPDATE');
    $existing->execute([':email' => $newEmail, ':user_id' => $user['id']]);
    $pending = $pdo->prepare(
        'SELECT user_id FROM email_change_requests
         WHERE new_email = :email AND user_id <> :user_id AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
         LIMIT 1 FOR UPDATE'
    );
    $pending->execute([':email' => $newEmail, ':user_id' => $user['id']]);
    if ($existing->fetchColumn() || $pending->fetchColumn()) {
        $pdo->commit();
        respond(['success' => true, 'message' => $genericMessage]);
    }

    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $statement = $pdo->prepare(
        'INSERT INTO email_change_requests (user_id, new_email, token_hash, expires_at)
         VALUES (:user_id, :new_email, :token_hash, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 MINUTE))
         ON DUPLICATE KEY UPDATE new_email = VALUES(new_email), token_hash = VALUES(token_hash),
            expires_at = VALUES(expires_at), used_at = NULL, created_at = CURRENT_TIMESTAMP'
    );
    $statement->execute([':user_id' => $user['id'], ':new_email' => $newEmail, ':token_hash' => $tokenHash]);
    accountAudit($pdo, (int) $user['id'], 'email_change_requested');
    $pdo->commit();

    $url = frontendUrl('#auth?mode=confirm-email-change&token=' . rawurlencode($token));
    $sent = actionEmail($newEmail, (string) $account['full_name'], 'Confirm your NodeConnect email change', 'Confirm this new email address within 30 minutes. Your current email remains unchanged until confirmation.', $url, 'Confirm email change');
    unset($token, $url);
    if (!$sent) {
        $pdo->prepare('UPDATE email_change_requests SET used_at = CURRENT_TIMESTAMP WHERE user_id = :user_id AND token_hash = :token_hash')->execute([':user_id' => $user['id'], ':token_hash' => $tokenHash]);
        respond(['success' => false, 'message' => 'The confirmation email could not be sent. Please try again later.'], 503);
    }
    respond(['success' => true, 'message' => $genericMessage]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}