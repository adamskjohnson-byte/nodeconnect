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
    $userId = (int) $user['id'];

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $notifications = $pdo->prepare(
            'SELECT id, type, title, message, read_at, created_at
             FROM user_notifications
             WHERE user_id = :user_id
             ORDER BY created_at DESC, id DESC
             LIMIT 50'
        );
        $notifications->execute([':user_id' => $userId]);
        $unread = $pdo->prepare('SELECT COUNT(*) FROM user_notifications WHERE user_id = :user_id AND read_at IS NULL');
        $unread->execute([':user_id' => $userId]);
        respond(['success' => true, 'notifications' => $notifications->fetchAll(), 'unread_count' => (int) $unread->fetchColumn()]);
    }

    requireTrustedOrigin();
    if (!rateLimitAllowed($pdo, 'notification_update', (string) $userId, 60, 900)) {
        respond(['success' => false, 'message' => 'Too many notification updates. Please try again later.'], 429);
    }
    $data = requestData();
    $action = (string) ($data['action'] ?? '');
    if ($action === 'mark_all_read') {
        $statement = $pdo->prepare('UPDATE user_notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = :user_id AND read_at IS NULL');
        $statement->execute([':user_id' => $userId]);
        respond(['success' => true, 'updated' => $statement->rowCount()]);
    }
    if ($action === 'mark_read') {
        $notificationId = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($notificationId === false) {
            respond(['success' => false, 'message' => 'Invalid notification.'], 422);
        }
        $statement = $pdo->prepare(
            'UPDATE user_notifications SET read_at = CURRENT_TIMESTAMP
             WHERE id = :id AND user_id = :user_id AND read_at IS NULL'
        );
        $statement->execute([':id' => $notificationId, ':user_id' => $userId]);
        respond(['success' => true, 'updated' => $statement->rowCount()]);
    }

    respond(['success' => false, 'message' => 'Unsupported notification action.'], 422);
} catch (Throwable $error) {
    handleServerError($error);
}
