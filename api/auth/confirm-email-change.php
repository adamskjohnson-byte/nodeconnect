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
    if (!rateLimitAllowed($pdo, 'email_change_confirmation', activityClientIp() ?? 'unknown', 12, 900)) {
        respond(['success' => false, 'message' => 'Too many confirmation attempts. Please try again later.'], 429);
    }
    $data = requestData();
    $token = (string) ($data['token'] ?? '');
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
        respond(['success' => false, 'message' => 'This email change link is invalid or expired.'], 422);
    }

    $pdo->beginTransaction();
    $request = $pdo->prepare(
        'SELECT r.id, r.user_id, r.new_email, u.email AS old_email, u.full_name
         FROM email_change_requests r INNER JOIN users u ON u.id = r.user_id
         WHERE r.token_hash = :token_hash AND r.used_at IS NULL AND r.expires_at > CURRENT_TIMESTAMP
         LIMIT 1 FOR UPDATE'
    );
    $request->execute([':token_hash' => hash('sha256', $token)]);
    $change = $request->fetch();
    if (!$change) {
        $pdo->rollBack();
        unset($token);
        respond(['success' => false, 'message' => 'This email change link is invalid or expired.'], 422);
    }

    $conflict = $pdo->prepare('SELECT id FROM users WHERE email = :email AND id <> :user_id LIMIT 1 FOR UPDATE');
    $conflict->execute([':email' => $change['new_email'], ':user_id' => $change['user_id']]);
    if ($conflict->fetchColumn()) {
        $pdo->prepare('UPDATE email_change_requests SET used_at = CURRENT_TIMESTAMP WHERE id = :id')->execute([':id' => $change['id']]);
        $pdo->commit();
        unset($token);
        respond(['success' => false, 'message' => 'This email address is no longer available. Request a new email change.'], 409);
    }

    $update = $pdo->prepare('UPDATE users SET email = :email, email_verified_at = CURRENT_TIMESTAMP WHERE id = :user_id');
    $update->execute([':email' => $change['new_email'], ':user_id' => $change['user_id']]);
    $pdo->prepare('UPDATE email_change_requests SET used_at = CURRENT_TIMESTAMP WHERE id = :id')->execute([':id' => $change['id']]);
    accountAudit($pdo, (int) $change['user_id'], 'email_change_confirmed');
    $pdo->commit();
    unset($token);

    $notice = 'The email address on your NodeConnect account was changed. If this was not you, contact support immediately.';
    $html = '<div style="margin:0;background:#050807;padding:32px;font-family:Arial,sans-serif;color:#e8f1ed"><div style="max-width:560px;margin:auto;border:1px solid #174b35;border-radius:10px;background:#0b1210;padding:28px"><p style="color:#00ff88;font-size:12px;font-weight:bold">NODECONNECT SECURITY</p><h1 style="font-size:22px">Email address changed</h1><p style="color:#bac7c0;line-height:1.6">' . htmlspecialchars($notice, ENT_QUOTES, 'UTF-8') . '</p></div></div>';
    if (!sendResendEmail((string) $change['old_email'], 'Your NodeConnect email address changed', $html)) {
        error_log('NodeConnect previous-email security notification delivery failed.');
    }
    respond(['success' => true, 'message' => 'Your email address has been changed and verified.']);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}