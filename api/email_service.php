<?php
declare(strict_types=1);

function sendResendEmail(string $to, string $subject, string $html): bool
{
    try {
    $apiKey = trim(envValue('RESEND_API_KEY'));
    $fromEmail = trim(envValue('RESEND_FROM_EMAIL'));
    $fromName = trim(envValue('RESEND_FROM_NAME', 'NodeConnect'));
    if ($apiKey === '' || !filter_var($fromEmail, FILTER_VALIDATE_EMAIL) || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        error_log('NodeConnect email delivery is not configured.');
        return false;
    }

    $payload = json_encode([
        'from' => $fromName . ' <' . $fromEmail . '>',
        'to' => [$to],
        'subject' => $subject,
        'html' => $html,
    ], JSON_UNESCAPED_SLASHES);
    if (!is_string($payload)) {
        error_log('NodeConnect email payload could not be encoded.');
        return false;
    }

    $handle = curl_init('https://api.resend.com/emails');
    curl_setopt_array($handle, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $apiKey,
            'Content-Type: application/json',
            'Accept: application/json',
        ],
    ]);
    $response = curl_exec($handle);
    $status = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
    $curlError = curl_error($handle);
    curl_close($handle);

    if (!is_string($response) || $status < 200 || $status >= 300) {
        error_log('NodeConnect email delivery failed; HTTP ' . $status . ($curlError !== '' ? '; transport error' : '') . '.');
        return false;
    }
    return true;
    } catch (Throwable $error) {
        error_log('NodeConnect email transport failed.');
        return false;
    }
}
