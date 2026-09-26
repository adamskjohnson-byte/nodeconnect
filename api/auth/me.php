<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $user = currentUser(database());
    if ($user === null) {
        respond(['success' => false, 'message' => 'Not authenticated.'], 401);
    }
    respond(['success' => true, 'user' => safeUser($user)]);
} catch (Throwable $error) {
    handleServerError($error);
}
