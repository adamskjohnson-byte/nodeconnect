<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/account_support.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    requireTrustedOrigin();
    $pdo = database();
    $user = currentUser($pdo);
    clearCurrentSession($pdo);
    if ($user !== null) {
        logActivity($pdo, (int) $user['id'], 'logout');
    }
    respond(['success' => true, 'message' => 'Signed out successfully.']);
} catch (Throwable $error) {
    handleServerError($error);
}
