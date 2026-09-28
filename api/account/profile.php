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
    $referralId = ensureReferralId($pdo, (int) $user['id']);
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        requireTrustedOrigin();
        $data = requestData();
        $fullName = trim((string) ($data['full_name'] ?? ''));
        if ($fullName === '' || mb_strlen($fullName) > 150) {
            respond(['success' => false, 'message' => 'Enter a name between 1 and 150 characters.'], 422);
        }
        $pdo->beginTransaction();
        $statement = $pdo->prepare('UPDATE users SET full_name = :full_name WHERE id = :user_id AND status = \'active\'');
        $statement->execute([':full_name' => $fullName, ':user_id' => $user['id']]);
        accountAudit($pdo, (int) $user['id'], 'profile_updated');
        $statement = $pdo->prepare(
            'SELECT u.id, u.full_name, u.email, u.status, u.role, u.email_verified_at, u.created_at, u.last_login_at,
                    i.updated_at AS profile_image_updated_at
             FROM users u LEFT JOIN user_profile_images i ON i.user_id = u.id WHERE u.id = :id LIMIT 1'
        );
        $statement->execute([':id' => $user['id']]);
        $updatedUser = $statement->fetch();
        $pdo->commit();
        $safe = safeUser($updatedUser);
        $safe['referral_id'] = $referralId;
        $safe['profile_image_version'] = $updatedUser['profile_image_updated_at'];
        respond(['success' => true, 'user' => $safe]);
    }

    $statement = $pdo->prepare(
        'SELECT u.id, u.full_name, u.email, u.status, u.role, u.email_verified_at, u.created_at, u.last_login_at,
                i.updated_at AS profile_image_updated_at
         FROM users u LEFT JOIN user_profile_images i ON i.user_id = u.id WHERE u.id = :id LIMIT 1'
    );
    $statement->execute([':id' => $user['id']]);
    $profile = $statement->fetch();
    $safe = safeUser($profile);
    $safe['referral_id'] = $referralId;
    $safe['profile_image_version'] = $profile['profile_image_updated_at'];
    respond(['success' => true, 'user' => $safe]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
