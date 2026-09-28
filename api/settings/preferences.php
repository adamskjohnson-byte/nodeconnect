<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/account_support.php';

if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', ['GET', 'POST'], true)) {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

function preferencesForUser(PDO $pdo, int $userId): array
{
    $pdo->prepare('INSERT IGNORE INTO user_preferences (user_id) VALUES (:user_id)')->execute([':user_id' => $userId]);
    $statement = $pdo->prepare(
        'SELECT theme, sound_enabled, sound_volume, activity_notifications, staking_notifications,
                reward_notifications, referral_notifications, language, currency
         FROM user_preferences WHERE user_id = :user_id LIMIT 1'
    );
    $statement->execute([':user_id' => $userId]);
    $preferences = $statement->fetch();
    foreach (['sound_enabled', 'activity_notifications', 'staking_notifications', 'reward_notifications', 'referral_notifications'] as $key) {
        $preferences[$key] = (bool) $preferences[$key];
    }
    $preferences['sound_volume'] = (int) $preferences['sound_volume'];
    return $preferences;
}

try {
    $pdo = database();
    $user = requireUser($pdo);
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        respond(['success' => true, 'preferences' => preferencesForUser($pdo, (int) $user['id'])]);
    }

    requireTrustedOrigin();
    $data = requestData();
    $rules = [
        'theme' => static fn ($value): bool => is_string($value) && in_array($value, ['dark', 'light', 'system'], true),
        'sound_enabled' => static fn ($value): bool => is_bool($value),
        'sound_volume' => static fn ($value): bool => is_int($value) && $value >= 0 && $value <= 100,
        'activity_notifications' => static fn ($value): bool => is_bool($value),
        'staking_notifications' => static fn ($value): bool => is_bool($value),
        'reward_notifications' => static fn ($value): bool => is_bool($value),
        'referral_notifications' => static fn ($value): bool => is_bool($value),
        'language' => static fn ($value): bool => is_string($value) && in_array($value, [
            'en', 'fr', 'es', 'pt', 'de', 'it', 'nl', 'ru', 'uk', 'pl', 'tr', 'ar',
            'zh-CN', 'zh-TW', 'ja', 'ko', 'hi', 'id', 'vi', 'th', 'bn', 'ro', 'el', 'sk', 'zu',
        ], true),
        'currency' => static fn ($value): bool => is_string($value) && $value === 'USD',
    ];
    if ($data === [] || array_diff(array_keys($data), array_keys($rules)) !== []) {
        respond(['success' => false, 'message' => 'Invalid preference fields.'], 422);
    }
    foreach ($data as $key => $value) {
        if (!$rules[$key]($value)) {
            respond(['success' => false, 'message' => 'One or more preference values are invalid.'], 422);
        }
    }

    $pdo->prepare('INSERT IGNORE INTO user_preferences (user_id) VALUES (:user_id)')->execute([':user_id' => $user['id']]);
    $assignments = [];
    $parameters = [':user_id' => $user['id']];
    foreach ($data as $key => $value) {
        $assignments[] = "{$key} = :{$key}";
        $parameters[":" . $key] = is_bool($value) ? (int) $value : $value;
    }
    $pdo->beginTransaction();
    $update = $pdo->prepare('UPDATE user_preferences SET ' . implode(', ', $assignments) . ' WHERE user_id = :user_id');
    $update->execute($parameters);
    accountAudit($pdo, (int) $user['id'], 'preferences_updated', ['fields' => array_keys($data)]);
    $savedPreferences = preferencesForUser($pdo, (int) $user['id']);
    $pdo->commit();
    respond(['success' => true, 'preferences' => $savedPreferences]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    handleServerError($error);
}
