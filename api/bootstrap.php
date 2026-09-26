<?php
declare(strict_types=1);

const AUTH_COOKIE = 'nodeconnect_session';
const SESSION_LIFETIME = 604800;

function loadEnvironmentFile(): void
{
    static $loaded = false;
    if ($loaded) {
        return;
    }
    $loaded = true;

    $paths = [__DIR__ . '/.env', dirname(__DIR__) . '/.env'];
    $path = null;
    foreach ($paths as $candidate) {
        if (is_readable($candidate)) {
            $path = $candidate;
            break;
        }
    }
    if ($path === null) {
        return;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if ($key === '' || getenv($key) !== false) {
            continue;
        }
        if (strlen($value) >= 2 && (($value[0] === '"' && $value[-1] === '"') || ($value[0] === "'" && $value[-1] === "'"))) {
            $value = substr($value, 1, -1);
        }
        putenv($key . '=' . $value);
    }
}

function envValue(string $key, string $default = ''): string
{
    $value = getenv($key);
    return $value === false ? $default : $value;
}

function allowedOrigin(): ?string
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = array_filter(array_map('trim', explode(',', envValue(
        'NODECONNECT_ALLOWED_ORIGINS',
        'http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://localhost:5173,http://localhost:5174,http://localhost:5175'
    ))));

    return in_array($origin, $allowed, true) ? $origin : null;
}

function configureResponse(): void
{
    header('Content-Type: application/json; charset=utf-8');
    $origin = allowedOrigin();
    if ($origin !== null) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function requestData(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function database(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = envValue('NODECONNECT_DB_HOST', '127.0.0.1');
    $port = envValue('NODECONNECT_DB_PORT', '3306');
    $name = envValue('NODECONNECT_DB_NAME', 'nodeconnect');
    $user = envValue('NODECONNECT_DB_USER', 'root');
    $password = envValue('NODECONNECT_DB_PASSWORD', '');

    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    return $pdo;
}

function safeUser(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'full_name' => $user['full_name'],
        'email' => $user['email'],
        'status' => $user['status'],
        'role' => $user['role'] ?? 'user',
        'created_at' => $user['created_at'],
        'last_login_at' => $user['last_login_at'],
    ];
}

function sessionCookieOptions(int $expires): array
{
    return [
        'expires' => $expires,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ];
}

function establishSession(PDO $pdo, int $userId): void
{
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $expiresAt = (new DateTimeImmutable('+' . SESSION_LIFETIME . ' seconds'))->format('Y-m-d H:i:s');

    $statement = $pdo->prepare('INSERT INTO auth_sessions (user_id, session_token_hash, expires_at) VALUES (:user_id, :token_hash, :expires_at)');
    $statement->execute([
        ':user_id' => $userId,
        ':token_hash' => $tokenHash,
        ':expires_at' => $expiresAt,
    ]);

    setcookie(AUTH_COOKIE, $token, sessionCookieOptions(time() + SESSION_LIFETIME));
}

function currentUser(PDO $pdo): ?array
{
    $token = $_COOKIE[AUTH_COOKIE] ?? '';
    if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/', $token)) {
        return null;
    }

    $tokenHash = hash('sha256', $token);
    $statement = $pdo->prepare(
        'SELECT u.id, u.full_name, u.email, u.status, u.role, u.created_at, u.last_login_at, s.id AS session_id
         FROM auth_sessions s
         INNER JOIN users u ON u.id = s.user_id
         WHERE s.session_token_hash = :token_hash AND s.expires_at > CURRENT_TIMESTAMP
         LIMIT 1'
    );
    $statement->execute([':token_hash' => $tokenHash]);
    $user = $statement->fetch();

    if (!$user || $user['status'] !== 'active') {
        return null;
    }

    $touch = $pdo->prepare('UPDATE auth_sessions SET last_activity_at = CURRENT_TIMESTAMP WHERE id = :session_id');
    $touch->execute([':session_id' => $user['session_id']]);
    unset($user['session_id']);
    return $user;
}

function requireUser(PDO $pdo): array
{
    $user = currentUser($pdo);
    if ($user === null) {
        respond(['success' => false, 'message' => 'Authentication required.'], 401);
    }
    return $user;
}

function requireAdmin(PDO $pdo): array
{
    $user = requireUser($pdo);
    if (($user['role'] ?? 'user') !== 'admin') {
        respond(['success' => false, 'message' => 'Administrator access required.'], 403);
    }
    return $user;
}

function clearCurrentSession(PDO $pdo): void
{
    $token = $_COOKIE[AUTH_COOKIE] ?? '';
    if (is_string($token) && preg_match('/^[a-f0-9]{64}$/', $token)) {
        $statement = $pdo->prepare('DELETE FROM auth_sessions WHERE session_token_hash = :token_hash');
        $statement->execute([':token_hash' => hash('sha256', $token)]);
    }

    setcookie(AUTH_COOKIE, '', sessionCookieOptions(time() - 3600));
}

function logActivity(PDO $pdo, ?int $userId, string $eventType): void
{
    $statement = $pdo->prepare(
        'INSERT INTO auth_activity (user_id, event_type, ip_address, user_agent)
         VALUES (:user_id, :event_type, :ip_address, :user_agent)'
    );
    $statement->execute([
        ':user_id' => $userId,
        ':event_type' => $eventType,
        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
        ':user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 500) : null,
    ]);
}

function handleServerError(Throwable $error): never
{
    error_log($error->getMessage());
    respond(['success' => false, 'message' => 'Something went wrong. Please try again.'], 500);
}

loadEnvironmentFile();
configureResponse();
