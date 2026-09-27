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
    $status = $pdo->prepare('SELECT enabled_at FROM user_two_factor WHERE user_id = :user_id LIMIT 1');
    $status->execute([':user_id' => $user['id']]);
    $enabledAt = $status->fetchColumn();
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        respond(['success' => true, 'enabled' => $enabledAt !== false && $enabledAt !== null]);
    }

    requireTrustedOrigin();
    $data = requestData();
    $action = (string) ($data['action'] ?? '');
    $password = (string) ($data['password'] ?? '');
    if (!rateLimitAllowed($pdo, 'two_factor_management', (string) $user['id'] . ':' . (activityClientIp() ?? 'unknown'), 10, 900)) {
        respond(['success' => false, 'message' => 'Too many security changes. Please try again later.'], 429);
    }
    $passwordQuery = $pdo->prepare('SELECT password_hash FROM users WHERE id = :id LIMIT 1');
    $passwordQuery->execute([':id' => $user['id']]);
    $passwordHash = $passwordQuery->fetchColumn();
    if (!is_string($passwordHash) || !password_verify($password, $passwordHash)) {
        respond(['success' => false, 'message' => 'Password confirmation is incorrect.'], 422);
    }

    $google2fa = new PragmaRX\Google2FA\Google2FA();
    if ($action === 'begin') {
        if ($enabledAt !== false && $enabledAt !== null) {
            respond(['success' => false, 'message' => 'Two-factor authentication is already enabled.'], 409);
        }
        $secret = $google2fa->generateSecretKey(32);
        $encrypted = encryptAccountSecret($secret);
        $statement = $pdo->prepare(
            'INSERT INTO user_two_factor (user_id, secret_encrypted, enabled_at, setup_expires_at)
             VALUES (:user_id, :secret, NULL, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 20 MINUTE))
             ON DUPLICATE KEY UPDATE secret_encrypted = VALUES(secret_encrypted), enabled_at = NULL, setup_expires_at = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 20 MINUTE), updated_at = CURRENT_TIMESTAMP'
        );
        $statement->execute([':user_id' => $user['id'], ':secret' => $encrypted]);
        accountAudit($pdo, (int) $user['id'], 'two_factor_setup_started');
        $uri = $google2fa->getQRCodeUrl('NodeConnect', (string) $user['email'], $secret);
        respond(['success' => true, 'secret' => $secret, 'provisioning_uri' => $uri]);
    }

    if ($action === 'enable') {
        $code = trim((string) ($data['code'] ?? ''));
        $statement = $pdo->prepare('SELECT secret_encrypted, enabled_at, setup_expires_at FROM user_two_factor WHERE user_id = :user_id LIMIT 1');
        $statement->execute([':user_id' => $user['id']]);
        $pending = $statement->fetch();
        if (!$pending || $pending['enabled_at'] !== null || !$pending['setup_expires_at'] || strtotime($pending['setup_expires_at']) <= time()) {
            respond(['success' => false, 'message' => 'Start two-factor setup again before confirming.'], 409);
        }
        $secret = decryptAccountSecret((string) $pending['secret_encrypted']);
        $verifiedTimestamp = preg_match('/^\d{6}$/', $code) ? $google2fa->verifyKeyNewer($secret, $code, 0, 1) : false;
        if ($verifiedTimestamp === false) {
            unset($secret, $code);
            respond(['success' => false, 'message' => 'Authenticator code is invalid.'], 422);
        }
        unset($secret, $code);
        $pdo->beginTransaction();
        $pdo->prepare('UPDATE user_two_factor SET enabled_at = CURRENT_TIMESTAMP, setup_expires_at = NULL, last_used_at = CURRENT_TIMESTAMP, last_totp_timestamp = :timestamp WHERE user_id = :user_id')->execute([':timestamp' => $verifiedTimestamp, ':user_id' => $user['id']]);
        $codes = createRecoveryCodes($pdo, (int) $user['id']);
        accountAudit($pdo, (int) $user['id'], 'two_factor_enabled');
        $pdo->commit();
        securityEmail($pdo, (int) $user['id'], 'two_factor_enabled', 'Two-factor authentication enabled', 'Two-factor authentication was enabled on your NodeConnect account.');
        respond(['success' => true, 'message' => 'Two-factor authentication enabled.', 'recovery_codes' => $codes]);
    }

    if ($action === 'disable') {
        $code = trim((string) ($data['code'] ?? ''));
        if ($enabledAt === false || $enabledAt === null || !preg_match('/^\d{6}$/', $code)) {
            respond(['success' => false, 'message' => 'Enter a valid authenticator code.'], 422);
        }
        $statement = $pdo->prepare('SELECT secret_encrypted, last_totp_timestamp FROM user_two_factor WHERE user_id = :user_id AND enabled_at IS NOT NULL LIMIT 1');
        $statement->execute([':user_id' => $user['id']]);
        $factor = $statement->fetch();
        if (!$factor) {
            respond(['success' => false, 'message' => 'Two-factor authentication is not enabled.'], 409);
        }
        $secret = decryptAccountSecret((string) ($factor['secret_encrypted'] ?? ''));
        $verifiedTimestamp = $google2fa->verifyKeyNewer($secret, $code, $factor['last_totp_timestamp'] === null ? 0 : (int) $factor['last_totp_timestamp'], 1);
        unset($secret, $code);
        if ($verifiedTimestamp === false) {
            respond(['success' => false, 'message' => 'Authenticator code is invalid.'], 422);
        }
        $pdo->beginTransaction();
        $pdo->prepare('DELETE FROM user_recovery_codes WHERE user_id = :user_id')->execute([':user_id' => $user['id']]);
        $pdo->prepare('DELETE FROM user_two_factor WHERE user_id = :user_id')->execute([':user_id' => $user['id']]);
        accountAudit($pdo, (int) $user['id'], 'two_factor_disabled');
        $pdo->commit();
        securityEmail($pdo, (int) $user['id'], 'two_factor_disabled', 'Two-factor authentication disabled', 'Two-factor authentication was disabled on your NodeConnect account.');
        respond(['success' => true, 'message' => 'Two-factor authentication disabled.']);
    }

    if ($action === 'regenerate_codes') {
        $code = trim((string) ($data['code'] ?? ''));
        $statement = $pdo->prepare('SELECT secret_encrypted, last_totp_timestamp FROM user_two_factor WHERE user_id = :user_id AND enabled_at IS NOT NULL LIMIT 1');
        $statement->execute([':user_id' => $user['id']]);
        $factor = $statement->fetch();
        if (!$factor || !preg_match('/^\d{6}$/', $code)) {
            respond(['success' => false, 'message' => 'Two-factor authentication is not enabled or the code is invalid.'], 422);
        }
        $secret = decryptAccountSecret((string) $factor['secret_encrypted']);
        $verifiedTimestamp = $google2fa->verifyKeyNewer($secret, $code, $factor['last_totp_timestamp'] === null ? 0 : (int) $factor['last_totp_timestamp'], 1);
        unset($secret, $code);
        if ($verifiedTimestamp === false) {
            respond(['success' => false, 'message' => 'Authenticator code is invalid.'], 422);
        }
        $pdo->beginTransaction();
        $codes = createRecoveryCodes($pdo, (int) $user['id']);
        $pdo->prepare('UPDATE user_two_factor SET last_totp_timestamp = :timestamp, last_used_at = CURRENT_TIMESTAMP WHERE user_id = :user_id')->execute([':timestamp' => $verifiedTimestamp, ':user_id' => $user['id']]);
        accountAudit($pdo, (int) $user['id'], 'recovery_codes_regenerated');
        $pdo->commit();
        respond(['success' => true, 'recovery_codes' => $codes]);
    }

    respond(['success' => false, 'message' => 'Unsupported two-factor action.'], 422);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
