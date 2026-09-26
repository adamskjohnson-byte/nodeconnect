<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/activity_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) {
    respond(['success' => false, 'message' => 'Request too large.'], 413);
}

try {
    $data = requestData();
    $eventType = (string) ($data['event_type'] ?? '');
    if (!in_array($eventType, TRACKED_ACTIVITY_EVENTS, true)) {
        respond(['success' => false, 'message' => 'Unsupported activity event.'], 422);
    }

    $pdo = database();
    $recorded = recordActivity($pdo, $eventType, $data);
    respond(['success' => true, 'recorded' => $recorded]);
} catch (Throwable $error) {
    handleServerError($error);
}
