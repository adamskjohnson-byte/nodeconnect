<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    respond(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $pdo = database();
    requireAdmin($pdo);

    $page = max(1, (int) ($_GET['page'] ?? 1));
    $perPage = min(100, max(10, (int) ($_GET['per_page'] ?? 25)));
    $offset = ($page - 1) * $perPage;
    $eventType = trim((string) ($_GET['event_type'] ?? ''));
    $countryCode = trim((string) ($_GET['country_code'] ?? ''));
    $dateFrom = trim((string) ($_GET['date_from'] ?? ''));
    $dateTo = trim((string) ($_GET['date_to'] ?? ''));

    $conditions = [];
    $parameters = [];
    if ($eventType !== '') {
        if (!in_array($eventType, ['site_visit', 'telegram_click'], true)) {
            respond(['success' => false, 'message' => 'Unsupported activity event.'], 422);
        }
        $conditions[] = 'event_type = :event_type';
        $parameters[':event_type'] = $eventType;
    }
    if ($countryCode !== '') {
        $conditions[] = 'country_code = :country_code';
        $parameters[':country_code'] = substr($countryCode, 0, 10);
    }
    if ($dateFrom !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFrom)) {
        $conditions[] = 'created_at >= :date_from';
        $parameters[':date_from'] = $dateFrom . ' 00:00:00';
    }
    if ($dateTo !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateTo)) {
        $conditions[] = 'created_at < DATE_ADD(:date_to, INTERVAL 1 DAY)';
        $parameters[':date_to'] = $dateTo . ' 00:00:00';
    }

    $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';
    $countStatement = $pdo->prepare("SELECT COUNT(*) FROM admin_activity {$where}");
    $countStatement->execute($parameters);
    $total = (int) $countStatement->fetchColumn();

    $statement = $pdo->prepare(
        "SELECT id, event_type, country, country_code, region, city, timezone, device_type, browser,
                operating_system, page_path, created_at
         FROM admin_activity {$where}
         ORDER BY created_at DESC, id DESC
         LIMIT :limit OFFSET :offset"
    );
    foreach ($parameters as $key => $value) {
        $statement->bindValue($key, $value);
    }
    $statement->bindValue(':limit', $perPage, PDO::PARAM_INT);
    $statement->bindValue(':offset', $offset, PDO::PARAM_INT);
    $statement->execute();

    $summary = $pdo->query(
        "SELECT
            (SELECT COUNT(*) FROM admin_activity WHERE event_type = 'site_visit' AND created_at >= CURRENT_DATE) AS visitors_today,
            (SELECT COUNT(*) FROM admin_activity WHERE event_type = 'site_visit' AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 6 DAY)) AS visitors_this_week,
            (SELECT COUNT(*) FROM admin_activity WHERE event_type = 'telegram_click' AND created_at >= CURRENT_DATE) AS telegram_clicks_today,
            (SELECT created_at FROM admin_activity WHERE event_type = 'site_visit' ORDER BY created_at DESC, id DESC LIMIT 1) AS latest_visitor_at"
    )->fetch() ?: [];

    respond([
        'success' => true,
        'summary' => [
            'visitors_today' => (int) ($summary['visitors_today'] ?? 0),
            'visitors_this_week' => (int) ($summary['visitors_this_week'] ?? 0),
            'telegram_clicks_today' => (int) ($summary['telegram_clicks_today'] ?? 0),
            'latest_visitor_at' => $summary['latest_visitor_at'] ?? null,
        ],
        'activity' => $statement->fetchAll(),
        'pagination' => ['page' => $page, 'per_page' => $perPage, 'total' => $total, 'pages' => max(1, (int) ceil($total / $perPage))],
    ]);
} catch (Throwable $error) {
    handleServerError($error);
}
