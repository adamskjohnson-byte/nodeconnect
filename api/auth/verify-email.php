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
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
        respond(['success' => false, 'message' => 'This verification link is invalid or expired.'], 422);
    }
    if (!rateLimitAllowed($pdo, 'email_verification', activityClientIp() ?? 'unknown', 20, 3600)) {
        respond(['success' => false, 'message' => 'Too many verification attempts. Please try again later.'], 429);
    }

    $pdo->beginTransaction();
    $statement = $pdo->prepare('SELECT id, user_id FROM email_verification_tokens WHERE token_hash = :token_hash AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP LIMIT 1 FOR UPDATE');
    $statement->execute([':token_hash' => hash('sha256', $token)]);
    $row = $statement->fetch();
    if (!$row) {
        $pdo->rollBack();
        respond(['success' => false, 'message' => 'This verification link is invalid or expired.'], 422);
    }
    $pdo->prepare('UPDATE users SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP) WHERE id = :id')->execute([':id' => $row['user_id']]);
    $pdo->prepare('UPDATE email_verification_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = :id')->execute([':id' => $row['id']]);
    accountAudit($pdo, (int) $row['user_id'], 'email_verified');
    $pdo->commit();
    unset($token);
    respond(['success' => true, 'message' => 'Email address verified.']);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
