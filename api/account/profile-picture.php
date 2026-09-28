<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/account_support.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'POST'], true)) {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $pdo = database();
    $user = requireUser($pdo);

    if ($method === 'GET') {
        $statement = $pdo->prepare('SELECT mime_type, image_data FROM user_profile_images WHERE user_id = :user_id LIMIT 1');
        $statement->execute([':user_id' => $user['id']]);
        $image = $statement->fetch();
        if (!$image) {
            http_response_code(404);
            exit;
        }
        header_remove('Content-Type');
        header('Content-Type: ' . $image['mime_type']);
        header('Content-Disposition: inline; filename="profile-image"');
        header('Cache-Control: private, no-store');
        echo $image['image_data'];
        exit;
    }

    requireTrustedOrigin();
    if (!rateLimitAllowed($pdo, 'profile_picture', (string) $user['id'] . ':' . (activityClientIp() ?? 'unknown'), 8, 3600)) {
        respond(['success' => false, 'message' => 'Too many profile image changes. Please try again later.'], 429);
    }

    $removeRequested = $method === 'POST' && !isset($_FILES['picture']) && (requestData()['action'] ?? '') === 'remove';
    if ($removeRequested) {
        $statement = $pdo->prepare('DELETE FROM user_profile_images WHERE user_id = :user_id');
        $statement->execute([':user_id' => $user['id']]);
        if ($statement->rowCount() > 0) {
            accountAudit($pdo, (int) $user['id'], 'profile_picture_removed');
        }
        respond(['success' => true, 'profile_image_version' => null, 'message' => 'Profile picture removed.']);
    }

    $file = $_FILES['picture'] ?? null;
    if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_uploaded_file((string) ($file['tmp_name'] ?? ''))) {
        respond(['success' => false, 'message' => 'Choose a valid image to upload.'], 422);
    }
    $size = (int) ($file['size'] ?? 0);
    if ($size < 1 || $size > 2 * 1024 * 1024) {
        respond(['success' => false, 'message' => 'The image must be no larger than 2 MB.'], 413);
    }

    $temporaryPath = (string) $file['tmp_name'];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($temporaryPath);
    $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    $imageInfo = @getimagesize($temporaryPath);
    if (!is_string($mimeType) || !in_array($mimeType, $allowedTypes, true)
        || !is_array($imageInfo) || ($imageInfo['mime'] ?? null) !== $mimeType) {
        respond(['success' => false, 'message' => 'Use a valid JPEG, PNG, or WebP image.'], 422);
    }
    $width = (int) ($imageInfo[0] ?? 0);
    $height = (int) ($imageInfo[1] ?? 0);
    if ($width < 1 || $height < 1 || $width > 2048 || $height > 2048 || $width * $height > 4_194_304) {
        respond(['success' => false, 'message' => 'Image dimensions must not exceed 2048 by 2048 pixels.'], 422);
    }
    $contents = file_get_contents($temporaryPath);
    if (!is_string($contents) || strlen($contents) !== $size) {
        respond(['success' => false, 'message' => 'The image could not be read. Please try again.'], 422);
    }

    $statement = $pdo->prepare(
        'INSERT INTO user_profile_images (user_id, mime_type, image_data, byte_size, width, height)
         VALUES (:user_id, :mime_type, :image_data, :byte_size, :width, :height)
         ON DUPLICATE KEY UPDATE mime_type = VALUES(mime_type), image_data = VALUES(image_data),
            byte_size = VALUES(byte_size), width = VALUES(width), height = VALUES(height), updated_at = CURRENT_TIMESTAMP'
    );
    $statement->bindValue(':user_id', (int) $user['id'], PDO::PARAM_INT);
    $statement->bindValue(':mime_type', $mimeType, PDO::PARAM_STR);
    $statement->bindValue(':image_data', $contents, PDO::PARAM_LOB);
    $statement->bindValue(':byte_size', $size, PDO::PARAM_INT);
    $statement->bindValue(':width', $width, PDO::PARAM_INT);
    $statement->bindValue(':height', $height, PDO::PARAM_INT);
    $statement->execute();
    unset($contents);
    accountAudit($pdo, (int) $user['id'], 'profile_picture_changed');

    $version = $pdo->prepare('SELECT updated_at FROM user_profile_images WHERE user_id = :user_id LIMIT 1');
    $version->execute([':user_id' => $user['id']]);
    respond(['success' => true, 'profile_image_version' => $version->fetchColumn(), 'message' => 'Profile picture saved.']);
} catch (Throwable $error) {
    handleServerError($error);
}