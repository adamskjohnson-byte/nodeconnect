<?php
declare(strict_types=1);

function resendSafeDiagnosticValue(string $value): string
{
    $value = preg_replace('/Bearer\s+[^\s,;]+/i', 'Bearer [redacted]', $value) ?? '';
    $value = preg_replace('/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i', '[email]', $value) ?? '';
    $value = preg_replace('/\b(?:re|sk|key)_[A-Z0-9_-]{8,}\b/i', '[redacted]', $value) ?? '';
    $value = preg_replace('/\b[a-f0-9]{32,}\b/i', '[redacted]', $value) ?? '';
    $value = preg_replace('/\b\d{6}\b/', '[redacted]', $value) ?? '';
    $value = preg_replace('/[\r\n\t]+/', ' ', $value) ?? '';
    return substr(trim($value), 0, 240);
}

function resendEmailDiagnostic(string $requestId, string $recipientDomain, int $status, int $curlErrno, string $curlError, string $responseBody): void
{
    $providerType = '';
    $providerMessage = '';
    $providerPayload = json_decode($responseBody, true);
    if (is_array($providerPayload)) {
        $providerType = resendSafeDiagnosticValue((string) ($providerPayload['name'] ?? $providerPayload['type'] ?? ''));
        $providerMessage = resendSafeDiagnosticValue((string) ($providerPayload['message'] ?? ''));
    }

    error_log(json_encode([
        'event' => 'nodeconnect_resend_delivery_failed',
        'time' => gmdate(DATE_ATOM),
        'request_id' => $requestId,
        'endpoint' => 'https://api.resend.com/emails',
        'recipient_domain' => $recipientDomain,
        'http_status' => $status,
        'curl_errno' => $curlErrno,
        'curl_error' => resendSafeDiagnosticValue($curlError),
        'provider_type' => $providerType,
        'provider_message' => $providerMessage,
    ], JSON_UNESCAPED_SLASHES));
}

function sendResendEmail(string $to, string $subject, string $html): bool
{
    try {
        $requestId = bin2hex(random_bytes(8));
        $to = strtolower(trim($to));
        $apiKey = trim(envValue('RESEND_API_KEY'));
        $fromEmail = strtolower(trim(envValue('RESEND_FROM_EMAIL')));
        $fromName = trim(envValue('RESEND_FROM_NAME', 'NodeConnect'));
        $recipientDomain = filter_var($to, FILTER_VALIDATE_EMAIL) ? substr(strrchr($to, '@'), 1) : 'invalid';
        if ($apiKey === '' || !filter_var($fromEmail, FILTER_VALIDATE_EMAIL) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
            resendEmailDiagnostic($requestId, $recipientDomain, 0, 0, 'Missing API key or invalid sender/recipient configuration.', '');
            return false;
        }
        if (!function_exists('curl_init')) {
            resendEmailDiagnostic($requestId, $recipientDomain, 0, 0, 'PHP cURL extension is unavailable.', '');
            return false;
        }

        $payload = json_encode([
            'from' => $fromName . ' <' . $fromEmail . '>',
            'to' => [$to],
            'subject' => $subject,
            'html' => $html,
        ], JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);

        $handle = curl_init('https://api.resend.com/emails');
        if ($handle === false) {
            resendEmailDiagnostic($requestId, $recipientDomain, 0, 0, 'Unable to initialize PHP cURL.', '');
            return false;
        }
        curl_setopt_array($handle, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
                'Accept: application/json',
            ],
        ]);
        $response = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
        $curlError = curl_error($handle);
        $curlErrno = curl_errno($handle);
        curl_close($handle);

        if (!is_string($response) || $status < 200 || $status >= 300) {
            resendEmailDiagnostic($requestId, $recipientDomain, $status, $curlErrno, $curlError, is_string($response) ? $response : '');
            return false;
        }
        return true;
    } catch (Throwable $error) {
        $requestId = isset($requestId) ? $requestId : bin2hex(random_bytes(8));
        resendEmailDiagnostic($requestId, isset($recipientDomain) ? $recipientDomain : 'unknown', 0, 0, get_class($error) . ': ' . $error->getMessage(), '');
        return false;
    }
}
