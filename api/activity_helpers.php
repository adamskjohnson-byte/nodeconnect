<?php
declare(strict_types=1);

const TRACKED_ACTIVITY_EVENTS = ['site_visit', 'telegram_click'];

function activityClientIp(): ?string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    return is_string($ip) && filter_var($ip, FILTER_VALIDATE_IP) ? $ip : null;
}

function activityUserAgent(): string
{
    return isset($_SERVER['HTTP_USER_AGENT']) ? substr((string) $_SERVER['HTTP_USER_AGENT'], 0, 1000) : '';
}

function parseActivityUserAgent(string $userAgent): array
{
    $device = 'Unknown';
    if (preg_match('/ipad|tablet|playbook|silk/i', $userAgent)) {
        $device = 'Tablet';
    } elseif (preg_match('/mobi|android|iphone|ipod|blackberry|windows phone/i', $userAgent)) {
        $device = 'Mobile';
    } elseif ($userAgent !== '') {
        $device = 'Desktop';
    }

    $browser = 'Unknown';
    $browserPatterns = [
        '/edg(?:e|a|ios)?\/([\d.]+)/i' => 'Edge',
        '/(?:opr|opera)\/([\d.]+)/i' => 'Opera',
        '/firefox\/([\d.]+)/i' => 'Firefox',
        '/(?:chrome|crios)\/([\d.]+)/i' => 'Chrome',
        '/version\/([\d.]+).*safari/i' => 'Safari',
        '/(?:msie |trident\/.*rv:)([\d.]+)/i' => 'Internet Explorer',
    ];
    foreach ($browserPatterns as $pattern => $name) {
        if (preg_match($pattern, $userAgent)) {
            $browser = $name;
            break;
        }
    }

    $operatingSystem = 'Unknown';
    $operatingSystemPatterns = [
        '/windows nt/i' => 'Windows',
        '/android/i' => 'Android',
        '/iphone|ipad|ipod/i' => 'iOS',
        '/mac os x|macintosh/i' => 'macOS',
        '/linux/i' => 'Linux',
        '/cros/i' => 'ChromeOS',
    ];
    foreach ($operatingSystemPatterns as $pattern => $name) {
        if (preg_match($pattern, $userAgent)) {
            $operatingSystem = $name;
            break;
        }
    }

    return [
        'device_type' => $device,
        'browser' => $browser,
        'operating_system' => $operatingSystem,
    ];
}

function privateActivityIp(?string $ip): bool
{
    return $ip === null || filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false;
}

function geolocateActivityIp(?string $ip): array
{
    if (privateActivityIp($ip)) {
        return [];
    }

    $baseUrl = rtrim(envValue('NODECONNECT_GEOLOCATION_URL', 'https://ipwho.is'), '/');
    $url = $baseUrl . '/' . rawurlencode((string) $ip);
    $response = false;

    if (function_exists('curl_init')) {
        $handle = curl_init($url);
        curl_setopt_array($handle, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 1,
            CURLOPT_TIMEOUT => 2,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
        ]);
        $response = curl_exec($handle);
        curl_close($handle);
    } else {
        $context = stream_context_create(['http' => ['timeout' => 2, 'ignore_errors' => true]]);
        $response = @file_get_contents($url, false, $context);
    }

    if (!is_string($response) || $response === '') {
        return [];
    }

    $payload = json_decode($response, true);
    if (!is_array($payload) || (array_key_exists('success', $payload) && $payload['success'] !== true)) {
        return [];
    }

    $timezone = $payload['timezone'] ?? null;
    if (is_array($timezone)) {
        $timezone = $timezone['id'] ?? null;
    }

    return array_filter([
        'country' => activityTextValue($payload['country'] ?? null, 100),
        'country_code' => activityTextValue($payload['country_code'] ?? null, 10),
        'region' => activityTextValue($payload['region'] ?? null, 150),
        'city' => activityTextValue($payload['city'] ?? null, 150),
        'timezone' => activityTextValue($timezone, 100),
    ], static fn ($value): bool => $value !== null && $value !== '');
}

function activityTextValue($value, int $maxLength): ?string
{
    if (!is_scalar($value)) {
        return null;
    }
    $value = trim((string) $value);
    return $value === '' ? null : substr($value, 0, $maxLength);
}

function activityAlreadyTracked(PDO $pdo, string $eventType, ?string $ipAddress, string $pagePath): bool
{
    $statement = $pdo->prepare(
        'SELECT id FROM admin_activity
         WHERE event_type = :event_type
           AND ip_address <=> :ip_address
           AND page_path = :page_path
           AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 30 SECOND)
         LIMIT 1'
    );
    $statement->execute([
        ':event_type' => $eventType,
        ':ip_address' => $ipAddress,
        ':page_path' => $pagePath,
    ]);
    return (bool) $statement->fetchColumn();
}

function recordActivity(PDO $pdo, string $eventType, array $data): bool
{
    $ipAddress = activityClientIp();
    $pagePath = activityTextValue($data['page_path'] ?? '/', 255) ?: '/';
    if (activityAlreadyTracked($pdo, $eventType, $ipAddress, $pagePath)) {
        return false;
    }

    $userAgent = activityUserAgent();
    $userAgentInfo = parseActivityUserAgent($userAgent);
    $geo = geolocateActivityIp($ipAddress);
    $metadata = json_encode(['geo_provider' => envValue('NODECONNECT_GEOLOCATION_URL', 'https://ipwho.is')], JSON_UNESCAPED_SLASHES);

    $statement = $pdo->prepare(
        'INSERT INTO admin_activity
            (event_type, country, country_code, region, city, timezone, ip_address, user_agent, device_type, browser, operating_system, page_path, referrer, metadata)
         VALUES
            (:event_type, :country, :country_code, :region, :city, :timezone, :ip_address, :user_agent, :device_type, :browser, :operating_system, :page_path, :referrer, :metadata)'
    );
    $statement->execute([
        ':event_type' => $eventType,
        ':country' => $geo['country'] ?? null,
        ':country_code' => $geo['country_code'] ?? null,
        ':region' => $geo['region'] ?? null,
        ':city' => $geo['city'] ?? null,
        ':timezone' => $geo['timezone'] ?? null,
        ':ip_address' => $ipAddress,
        ':user_agent' => $userAgent !== '' ? $userAgent : null,
        ':device_type' => $userAgentInfo['device_type'],
        ':browser' => $userAgentInfo['browser'],
        ':operating_system' => $userAgentInfo['operating_system'],
        ':page_path' => $pagePath,
        ':referrer' => activityTextValue($data['referrer'] ?? null, 2000),
        ':metadata' => $metadata,
    ]);

    sendActivityTelegramNotification($eventType, $geo, $userAgentInfo, $pagePath);
    return true;
}

function activityDisplayValue($value): string
{
    return is_string($value) && trim($value) !== '' ? $value : 'Unknown';
}

function sendActivityTelegramNotification(string $eventType, array $geo, array $userAgentInfo, string $pagePath): void
{
    $token = trim(envValue('TELEGRAM_BOT_TOKEN'));
    $chatId = trim(envValue('TELEGRAM_ADMIN_CHAT_ID'));
    if ($token === '' || $chatId === '' || strpos($token, 'your_') === 0 || strpos($chatId, 'your_') === 0) {
        return;
    }

    $title = $eventType === 'telegram_click' ? 'NodeConnect - Telegram Link Clicked' : 'NodeConnect - New Visitor';
    $message = implode("\n", [
        $title,
        'Country: ' . activityDisplayValue($geo['country'] ?? null),
        'Approx. location: ' . activityDisplayValue($geo['city'] ?? null) . ', ' . activityDisplayValue($geo['region'] ?? null),
        'Device: ' . activityDisplayValue($userAgentInfo['device_type'] ?? null),
        'Browser: ' . activityDisplayValue($userAgentInfo['browser'] ?? null),
        'OS: ' . activityDisplayValue($userAgentInfo['operating_system'] ?? null),
        'Page: ' . $pagePath,
        'Time: ' . gmdate('Y-m-d H:i:s') . ' UTC',
    ]);

    $url = 'https://api.telegram.org/bot' . rawurlencode($token) . '/sendMessage';
    $payload = http_build_query(['chat_id' => $chatId, 'text' => $message]);
    $response = false;
    if (function_exists('curl_init')) {
        $handle = curl_init($url);
        curl_setopt_array($handle, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 1,
            CURLOPT_TIMEOUT => 3,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $response = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
        curl_close($handle);
        if ($response === false || $status < 200 || $status >= 300) {
            error_log('NodeConnect activity Telegram notification failed.');
        }
        return;
    }

    $context = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => $payload,
        'timeout' => 3,
        'ignore_errors' => true,
    ]]);
    $response = @file_get_contents($url, false, $context);
    if ($response === false) {
        error_log('NodeConnect activity Telegram notification failed.');
    }
}
