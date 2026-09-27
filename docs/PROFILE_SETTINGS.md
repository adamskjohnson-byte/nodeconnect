# NodeConnect Profile and Account Security

This adds account-management functionality to the existing React/Vite + PHP/PDO + MySQL application. The existing `auth_sessions` cookie-token system, `users.role` authorization, wallet flows, visitor monitoring, Telegram tracking, and admin APIs remain in place.

## Database migration

Apply `database/migrations/002_account_security.sql` exactly once to the already-existing NodeConnect database, after `001_admin_activity.sql` has already been applied. It adds user preferences, verification tokens, encrypted TOTP storage, hashed recovery codes, temporary 2FA login challenges, persistent security audit/rate-limit tables, session device metadata columns, and `users.deactivated_at`. It reuses the existing `password_reset_tokens` table and does not change `admin_activity`.

Do not rerun migration 001. Do not run a migration automatically from PHP or the Railway image. Back up the current database before applying migration 002.

For local XAMPP, open phpMyAdmin, select `nodeconnect`, choose **Import**, select `database/migrations/002_account_security.sql`, and import once. For Railway, run the same file once against the existing Railway MySQL database using its supported SQL console/client. This project does not connect production API code to local XAMPP MySQL.

## Configuration

The Resend and account-security values are server-only. Put them in `api/.env` for local XAMPP and in the Railway PHP API service variables for production. Never put them in Vercel or variables prefixed `VITE_`.

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=no-reply@canopynodeconnect.com
RESEND_FROM_NAME=NodeConnect
NODECONNECT_FRONTEND_URL=http://127.0.0.1:5174
NODECONNECT_2FA_ENCRYPTION_KEY=
NODECONNECT_RATE_LIMIT_KEY=
NODECONNECT_ENV=local
```

The sender address must be an address allowed by the verified Resend domain. Production `NODECONNECT_FRONTEND_URL` is `https://canopynodeconnect.com`, and `NODECONNECT_ENV=production`.

Generate independent keys for local and production; do not commit either value:

```powershell
php -r "echo base64_encode(random_bytes(32)), PHP_EOL;"
php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
```

Use the base64 output for `NODECONNECT_2FA_ENCRYPTION_KEY` (exactly 32 decoded bytes) and the hex output for `NODECONNECT_RATE_LIMIT_KEY` (at least 32 characters). Back up the TOTP encryption key securely. Losing it makes stored TOTP seeds undecryptable; rotating it requires a planned re-encryption procedure.

The development environment can omit `NODECONNECT_RATE_LIMIT_KEY` and uses a deterministic development-only fallback scope. Production deliberately fails closed if the persistent rate-limit HMAC key is absent. The existing Telegram and geolocation variables are unchanged.

## Resend

`api/email_service.php` sends HTTPS requests to Resend's REST API using PHP cURL. API keys and response bodies are not logged or returned. It sends no-reply verification, password-reset, password-change, 2FA, and deactivation messages. Configure these variables on the Railway PHP API service, never on Railway MySQL or Vercel:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`

After a password, 2FA, or deactivation update commits, an email failure is logged safely and does not undo the security operation. Password-reset request responses remain generic; if delivery fails, the user is not told that a message was successfully sent.

## Endpoints

- `GET/POST /account/profile.php`: retrieve and update only the current user's full name; email is read-only.
- `GET/POST /settings/preferences.php`: read/update whitelisted preferences for the authenticated user.
- `POST /account/password.php`: verify current password, change it, retain current session, revoke other sessions, audit, and send a security notification.
- `GET/POST /account/sessions.php`: list safe session data, revoke an owned session, or revoke other sessions. Raw session tokens/hashes are never returned. IP is masked in the response.
- `GET/POST /account/two-factor.php`: status, start setup, confirm/enable, disable, and regenerate recovery codes.
- `POST /account/deactivate.php`: reauthenticate and soft-deactivate the account; sets existing `users.status` to `disabled`, timestamps it, revokes sessions, preserves history, audits, and sends a notice.
- `POST /auth/resend-verification.php`: send a single-use verification link to the signed-in account.
- `POST /auth/verify-email.php`: consume a hashed, expiring verification token.
- `POST /auth/request-password-reset.php`: generic password-reset request response.
- `POST /auth/reset-password.php`: consume the existing hashed password-reset token, set the new password, revoke sessions, audit, and notify.
- `POST /auth/verify-2fa.php`: complete the short-lived login challenge using TOTP or a one-time recovery code.

All account mutation endpoints use the existing secure session and require an exact configured `Origin` allowlist match. User IDs, roles, ownership, and status are read server-side. SQL uses PDO prepared statements. Rate limits are persisted in MySQL, not process memory.

## Security behavior and limitations

- New registrations receive a hashed, 24-hour email-verification token. Verification is not required to log in, preserving existing accounts and the current login policy.
- Passwords use `password_hash()` and `password_verify()`. New/changed passwords require 12–128 characters with at least one letter and number. Passwords are not logged or emailed.
- Password reset tokens are stored as hashes, expire after one hour, are single use, invalidate earlier outstanding reset tokens, and revoke existing sessions.
- TOTP uses the maintained `pragmarx/google2fa` Composer package. Setup requires the current password and a valid TOTP before enabling. The seed is encrypted at rest using OpenSSL AES-256-GCM and a server-only key. Codes are checked with replay prevention.
- The QR image is generated locally in the frontend from the authenticated setup response; no external QR service receives the TOTP URI.
- Ten 128-bit recovery codes are shown once. Only SHA-256 hashes are stored; a successful code is consumed atomically.
- Login with 2FA enabled creates only a five-minute challenge cookie/database record before second-factor completion. Full auth session is established only after a valid code.
- Session rows store user-agent/device/browser/OS and IP server-side; the UI receives a masked IP and no cookie token or token hash.
- Account deactivation is soft: it disables sign-in and revokes sessions without deleting retained account/history data. Reactivation requires an administrator/support process; no self-service reactivation endpoint is provided.
- Preferences persist dark/light/system, sound toggle/volume, notification flags, language `en`, and currency `USD`. No sound playback is currently implemented; no sound is invented. Staking/reward/referral notification toggles are stored preferences only; corresponding event-delivery systems are not currently implemented. The app is not translated beyond English and financial values are not converted beyond USD.
- Cookie-authenticated writes require the exact allowlisted browser Origin, in addition to HttpOnly/Secure/SameSite cookie behavior. No wildcard credentialed CORS is used.
- API responses include `Cache-Control: no-store`, `X-Content-Type-Options`, and `Referrer-Policy`; CSP is not emitted by this JSON API.

## Local test flow

1. Import migration 002 once into local `nodeconnect`.
2. Configure local `api/.env` with the keys above and a valid Resend API key/sender if testing email.
3. Start XAMPP Apache/MySQL and Vite (`npm run dev`).
4. Sign in, open `#profile`, edit the name, refresh, and verify persistence/read-only email/status.
5. Open `#settings`; test dark/light/system, sound, volume, notifications, language, and currency, then refresh and sign in again.
6. Change password with valid/invalid current password and confirmation cases; check that only other sessions are revoked.
7. Open Manage Sessions, revoke another session, and verify its cookie no longer authenticates.
8. Enable 2FA, scan the locally rendered QR, verify a code, store recovery codes safely, sign out and test TOTP/recovery login, then test replayed and used codes.
9. Test verification and password-reset links for valid, expired, and used tokens. Check Resend delivery only after a real API key is configured.
10. Test account deactivation using password plus exact `DEACTIVATE` confirmation; confirm sessions are invalidated and account/history rows are retained.
11. Recheck normal/admin routing, visitor activity API, Telegram notifications, and each existing wallet provider flow.

## Manual acceptance checklist

Profile:

- [ ] View the logged-in user's actual full name, email, role, status, and member date.
- [ ] Edit/save a valid full name, refresh, and verify it persists.
- [ ] Cancel an edit and verify the saved name returns.
- [ ] Confirm email is read-only.

Preferences:

- [ ] Select Dark, Light, and System; verify appearance immediately and after refresh/login.
- [ ] Toggle Sound Effects and change volume; values persist. No sound is played unless an existing feature emits one.
- [ ] Toggle Activity, Staking, Rewards, and Referrals preferences; values persist.
- [ ] Verify English and USD persist. Other translations/currency conversion are not claimed.

Security:

- [ ] Change password with valid current password; test invalid current password, weak password, mismatch, and same-password rejection.
- [ ] Confirm current session remains and other sessions are revoked; receive the password-change security email.
- [ ] List sessions; identify current session; revoke another session; revoke all other sessions; confirm revoked cookies no longer authenticate.
- [ ] Enroll an authenticator, reject invalid code, accept valid code, save one-time recovery codes, and test login requiring TOTP.
- [ ] Verify a TOTP cannot be replayed in the same time window; verify recovery codes work once and fail on reuse.
- [ ] Disable TOTP with password and current TOTP; verify notification email.
- [ ] Request password reset for existing and nonexistent email and confirm the API response remains generic; test valid, expired, and consumed tokens.
- [ ] Verify email with valid, expired, and consumed links. Existing and unverified users can still sign in by design.
- [ ] Deactivate with password and exact `DEACTIVATE` confirmation; verify sessions are revoked and database history is retained.

Integration regression:

- [ ] Confirm normal users receive 403 for admin activity API and admins can still use admin dashboard/activity.
- [ ] Confirm visitor rows and Telegram notifications still work.
- [ ] Test each existing wallet provider and the Connect Wallet flow.
- [ ] Confirm Resend failures do not undo committed password/2FA/deactivation changes; verify Resend only after configuring a real Railway API key.
- [ ] Confirm no secrets are in browser requests/bundles or Git; check Secure HttpOnly cookie and CORS on HTTPS production domains.

Database-backed API scenarios require migration 002 first. No database migration was applied during implementation. Resend delivery cannot be claimed until valid server-side credentials are configured and a real message is received.
