<?php
declare(strict_types=1);

require_once __DIR__ . '/activity_helpers.php';
require_once __DIR__ . '/email_service.php';

function requireTrustedOrigin(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (!is_string($origin) || $origin === '' || allowedOrigin() !== $origin) {
        respond(['success' => false, 'message' => 'Request origin is not allowed.'], 403);
    }
}

function accountAudit(PDO $pdo, ?int $userId, string $eventType, array $metadata = []): void
{
    $allowedEvents = [
        'profile_updated', 'preferences_updated', 'password_changed', 'password_change_failed',
        'password_reset_requested', 'password_reset_completed', 'email_verification_sent', 'email_verified',
        'two_factor_setup_started', 'two_factor_enabled', 'two_factor_disabled', 'recovery_code_used', 'recovery_codes_regenerated',
        'session_revoked', 'sessions_revoked', 'account_deactivation_requested', 'account_deactivated',
    ];
    if (!in_array($eventType, $allowedEvents, true)) {
        throw new InvalidArgumentException('Unsupported security event.');
    }

    $statement = $pdo->prepare(
        'INSERT INTO security_events (user_id, event_type, ip_address, user_agent, metadata)
         VALUES (:user_id, :event_type, :ip_address, :user_agent, :metadata)'
    );
    $statement->execute([
        ':user_id' => $userId,
        ':event_type' => $eventType,
        ':ip_address' => activityClientIp(),
        ':user_agent' => activityUserAgent() !== '' ? substr(activityUserAgent(), 0, 500) : null,
        ':metadata' => $metadata === [] ? null : json_encode($metadata, JSON_UNESCAPED_SLASHES),
    ]);
}

function rateLimitAllowed(PDO $pdo, string $action, string $scope, int $maximum, int $windowSeconds, int $blockSeconds = 900): bool
{
    $scopeKey = envValue('NODECONNECT_RATE_LIMIT_KEY');
    if (strlen($scopeKey) < 32) {
        if (envValue('NODECONNECT_ENV', 'local') === 'production') {
            throw new RuntimeException('Persistent rate-limit key is not configured.');
        }
        $scopeKey = hash('sha256', 'NodeConnect local rate-limit scope|' . envValue('NODECONNECT_DB_NAME', 'nodeconnect'), true);
    }
    $scopeHash = hash_hmac('sha256', $action . "\0" . $scope, $scopeKey);
    $windowSeconds = max(1, min(86400, $windowSeconds));
    $blockSeconds = max(1, min(86400, $blockSeconds));
    $maximum = max(1, min(1000, $maximum));

    $statement = $pdo->prepare(
        'INSERT INTO security_rate_limits (action, scope_hash, attempts, window_started_at)
         VALUES (:action, :scope_hash, 1, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE
            attempts = IF(window_started_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ' . $windowSeconds . ' SECOND), 1, attempts + 1),
            blocked_until = IF(window_started_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ' . $windowSeconds . ' SECOND), NULL, blocked_until),
            window_started_at = IF(window_started_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ' . $windowSeconds . ' SECOND), CURRENT_TIMESTAMP, window_started_at)'
    );
    $statement->execute([':action' => $action, ':scope_hash' => $scopeHash]);

    $block = $pdo->prepare(
        'UPDATE security_rate_limits
         SET blocked_until = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ' . $blockSeconds . ' SECOND)
         WHERE action = :action AND scope_hash = :scope_hash AND attempts > :maximum
           AND (blocked_until IS NULL OR blocked_until <= CURRENT_TIMESTAMP)'
    );
    $block->execute([':action' => $action, ':scope_hash' => $scopeHash, ':maximum' => $maximum]);

    $check = $pdo->prepare('SELECT (blocked_until IS NOT NULL AND blocked_until > CURRENT_TIMESTAMP) FROM security_rate_limits WHERE action = :action AND scope_hash = :scope_hash LIMIT 1');
    $check->execute([':action' => $action, ':scope_hash' => $scopeHash]);
    return (int) $check->fetchColumn() === 0;
}

function accountPasswordValid(string $password): bool
{
    return strlen($password) >= 12 && strlen($password) <= 128
        && preg_match('/[A-Za-z]/', $password) === 1
        && preg_match('/[0-9]/', $password) === 1;
}

function accountEncryptionKey(): string
{
    $encoded = envValue('NODECONNECT_2FA_ENCRYPTION_KEY');
    $key = base64_decode($encoded, true);
    if (!is_string($key) || strlen($key) !== 32) {
        throw new RuntimeException('Account security encryption is not configured.');
    }
    return $key;
}

function encryptAccountSecret(string $secret): string
{
    $nonce = random_bytes(12);
    $tag = '';
    $ciphertext = openssl_encrypt($secret, 'aes-256-gcm', accountEncryptionKey(), OPENSSL_RAW_DATA, $nonce, $tag);
    if (!is_string($ciphertext) || strlen($tag) !== 16) {
        throw new RuntimeException('Unable to encrypt account security secret.');
    }
    return base64_encode($nonce . $tag . $ciphertext);
}

function decryptAccountSecret(string $encrypted): string
{
    $payload = base64_decode($encrypted, true);
    if (!is_string($payload) || strlen($payload) <= 28) {
        throw new RuntimeException('Stored security secret is invalid.');
    }
    $nonce = substr($payload, 0, 12);
    $tag = substr($payload, 12, 16);
    $ciphertext = substr($payload, 28);
    $secret = openssl_decrypt($ciphertext, 'aes-256-gcm', accountEncryptionKey(), OPENSSL_RAW_DATA, $nonce, $tag);
    if (!is_string($secret)) {
        throw new RuntimeException('Unable to decrypt account security secret.');
    }
    return $secret;
}

function frontendUrl(string $hash): string
{
    return rtrim(envValue('NODECONNECT_FRONTEND_URL', 'https://canopynodeconnect.com'), '/') . '/' . $hash;
}

function createSingleUseToken(PDO $pdo, string $table, int $userId, int $lifetimeSeconds): string
{
    if (!in_array($table, ['email_verification_tokens', 'password_reset_tokens'], true)) {
        throw new InvalidArgumentException('Unsupported token table.');
    }
    $invalidate = $pdo->prepare("UPDATE {$table} SET used_at = CURRENT_TIMESTAMP WHERE user_id = :user_id AND used_at IS NULL");
    $invalidate->execute([':user_id' => $userId]);
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $expiresAt = (new DateTimeImmutable('+' . $lifetimeSeconds . ' seconds'))->format('Y-m-d H:i:s');
    $statement = $pdo->prepare("INSERT INTO {$table} (user_id, token_hash, expires_at) VALUES (:user_id, :token_hash, :expires_at)");
    $statement->execute([':user_id' => $userId, ':token_hash' => $tokenHash, ':expires_at' => $expiresAt]);
    return $token;
}

function createRecoveryCodes(PDO $pdo, int $userId): array
{
    $pdo->prepare('DELETE FROM user_recovery_codes WHERE user_id = :user_id')->execute([':user_id' => $userId]);
    $codes = [];
    $insert = $pdo->prepare('INSERT INTO user_recovery_codes (user_id, code_hash) VALUES (:user_id, :code_hash)');
    for ($index = 0; $index < 10; $index++) {
        $code = strtoupper(bin2hex(random_bytes(16)));
        $codes[] = substr($code, 0, 8) . '-' . substr($code, 8, 8) . '-' . substr($code, 16, 8) . '-' . substr($code, 24, 8);
        $insert->execute([':user_id' => $userId, ':code_hash' => hash('sha256', $code)]);
    }
    return $codes;
}

function consumeRecoveryCode(PDO $pdo, int $userId, string $code): bool
{
    $normalized = strtoupper(preg_replace('/[^A-F0-9]/', '', $code) ?? '');
    if (strlen($normalized) !== 32) {
        return false;
    }
    $statement = $pdo->prepare(
        'UPDATE user_recovery_codes SET used_at = CURRENT_TIMESTAMP
         WHERE user_id = :user_id AND code_hash = :code_hash AND used_at IS NULL'
    );
    $statement->execute([':user_id' => $userId, ':code_hash' => hash('sha256', $normalized)]);
    return $statement->rowCount() === 1;
}

function securityEmail(PDO $pdo, int $userId, string $eventType, string $subject, string $message): void
{
    try {
        $userQuery = $pdo->prepare('SELECT email, full_name FROM users WHERE id = :id LIMIT 1');
        $userQuery->execute([':id' => $userId]);
        $user = $userQuery->fetch();
        if (!$user) {
            return;
        }
        $html = '<div style="margin:0;background:#050807;padding:32px;font-family:Arial,sans-serif;color:#e8f1ed"><div style="max-width:560px;margin:auto;border:1px solid #174b35;border-radius:10px;background:#0b1210;padding:28px"><p style="color:#00ff88;font-size:12px;font-weight:bold;letter-spacing:2px">NODECONNECT SECURITY</p><h1 style="font-size:22px">' . htmlspecialchars($subject, ENT_QUOTES, 'UTF-8') . '</h1><p style="color:#bac7c0;line-height:1.6">Hello ' . htmlspecialchars((string) $user['full_name'], ENT_QUOTES, 'UTF-8') . ',</p><p style="color:#bac7c0;line-height:1.6">' . htmlspecialchars($message, ENT_QUOTES, 'UTF-8') . '</p><p style="color:#7d8983;font-size:12px">If this was not you, sign in and review your account security.</p></div></div>';
        if (!sendResendEmail((string) $user['email'], $subject, $html)) {
            error_log('NodeConnect security email delivery failed for event ' . $eventType . '.');
        }
    } catch (Throwable $error) {
        error_log('NodeConnect security email delivery failed for event ' . $eventType . '.');
    }
}

function actionEmail(string $to, string $name, string $subject, string $message, string $url, string $buttonLabel): bool
{
    $escapedName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $escapedMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
    $escapedUrl = htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
    $escapedButton = htmlspecialchars($buttonLabel, ENT_QUOTES, 'UTF-8');
    $escapedSubject = htmlspecialchars($subject, ENT_QUOTES, 'UTF-8');
    $html = '<div style="margin:0;background:#050807;padding:32px;font-family:Arial,sans-serif;color:#e8f1ed"><div style="max-width:560px;margin:auto;border:1px solid #174b35;border-radius:10px;background:#0b1210;padding:28px"><p style="color:#00ff88;font-size:12px;font-weight:bold;letter-spacing:2px">NODECONNECT</p><h1 style="font-size:22px">' . $escapedSubject . '</h1><p style="color:#bac7c0;line-height:1.6">Hello ' . $escapedName . ',</p><p style="color:#bac7c0;line-height:1.6">' . $escapedMessage . '</p><p><a href="' . $escapedUrl . '" style="display:inline-block;padding:12px 18px;background:#00ff88;color:#001c12;text-decoration:none;border-radius:6px;font-weight:bold">' . $escapedButton . '</a></p><p style="color:#7d8983;font-size:12px">If you did not request this, you can ignore this message.</p></div></div>';
    return sendResendEmail($to, $subject, $html);
}
