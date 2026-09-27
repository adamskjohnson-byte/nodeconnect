<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/account_support.php';

if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', ['GET', 'POST'], true)) {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

function maskedSessionIp(?string $ip): string
{
    if (!is_string($ip) || !filter_var($ip, FILTER_VALIDATE_IP)) {
        return 'Unknown';
    }
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        $parts = explode('.', $ip);
        $parts[3] = '0';
        return implode('.', $parts);
    }
    $parts = explode(':', $ip);
    return implode(':', array_slice($parts, 0, 3)) . ':*';
}

try {
    $pdo = database();
    $user = requireUser($pdo);
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $statement = $pdo->prepare(
            'SELECT id, ip_address, user_agent, device_type, browser, operating_system, created_at, last_activity_at, expires_at
             FROM auth_sessions WHERE user_id = :user_id AND expires_at > CURRENT_TIMESTAMP
             ORDER BY last_activity_at DESC'
        );
        $statement->execute([':user_id' => $user['id']]);
        $currentSessionId = currentSessionId($pdo);
        $sessions = array_map(static function (array $session) use ($currentSessionId): array {
            return [
                'id' => (int) $session['id'],
                'is_current' => (int) $session['id'] === $currentSessionId,
                'approximate_ip' => maskedSessionIp($session['ip_address']),
                'device_type' => $session['device_type'] ?: 'Unknown',
                'browser' => $session['browser'] ?: 'Unknown',
                'operating_system' => $session['operating_system'] ?: 'Unknown',
                'created_at' => $session['created_at'],
                'last_activity_at' => $session['last_activity_at'],
                'expires_at' => $session['expires_at'],
            ];
        }, $statement->fetchAll());
        respond(['success' => true, 'sessions' => $sessions]);
    }

    requireTrustedOrigin();
    $data = requestData();
    $action = (string) ($data['action'] ?? '');
    $currentSessionId = currentSessionId($pdo);
    if ($action === 'revoke') {
        $sessionId = filter_var($data['session_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$sessionId || $sessionId === $currentSessionId) {
            respond(['success' => false, 'message' => 'Choose another active session to revoke.'], 422);
        }
        $statement = $pdo->prepare('DELETE FROM auth_sessions WHERE id = :id AND user_id = :user_id');
        $statement->execute([':id' => $sessionId, ':user_id' => $user['id']]);
        if ($statement->rowCount() !== 1) {
            respond(['success' => false, 'message' => 'Session not found.'], 404);
        }
        accountAudit($pdo, (int) $user['id'], 'session_revoked');
        respond(['success' => true, 'message' => 'Session revoked.']);
    }
    if ($action === 'revoke_others') {
        $statement = $pdo->prepare('DELETE FROM auth_sessions WHERE user_id = :user_id AND id <> :current_session');
        $statement->execute([':user_id' => $user['id'], ':current_session' => $currentSessionId ?? 0]);
        accountAudit($pdo, (int) $user['id'], 'sessions_revoked', ['count' => $statement->rowCount()]);
        respond(['success' => true, 'revoked' => $statement->rowCount()]);
    }
    respond(['success' => false, 'message' => 'Unsupported session action.'], 422);
} catch (Throwable $error) {
    handleServerError($error);
}
