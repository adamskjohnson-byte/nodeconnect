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

`api/email_service.php` sends HTTPS requests to `https://api.resend.com/emails` using PHP cURL, TLS verification, a server-side bearer key, and a JSON request body. API keys, request payloads, response bodies, and full recipient addresses are never logged or returned. On delivery failure it logs a request ID, UTC timestamp, endpoint, recipient domain, HTTP status, cURL errno/error, and sanitized Resend error type/message. Configure these variables on the Railway PHP API service, never on Railway MySQL or Vercel:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`

After a password, 2FA, or deactivation update commits, an email failure is logged safely and does not undo the security operation. Password-reset request responses remain generic; if delivery fails, the user is not told that a message was successfully sent.

On 2026-09-27, the local PHP process made a read-only Resend domains request using its server-side configured key: HTTP 200, and `canopynodeconnect.com` was returned as `verified`. A credential-free TLS request also reached the Resend endpoint (HTTP 401 as expected without authorization). These checks do not establish that any message was accepted for a recipient or delivered. Railway environment variables and an actual recipient inbox have not been verified in this task.

## Endpoints

- `GET/POST /account/profile.php`: retrieve and update only the current user's full name; email is read-only.
- `GET/POST /settings/preferences.php`: read/update whitelisted preferences for the authenticated user.
- `POST /account/password.php`: verify current password, change it, retain current session, revoke other sessions, audit, and send a security notification.
- `GET/POST /account/sessions.php`: list safe session data, revoke an owned session, or revoke other sessions. Raw session tokens/hashes are never returned. IP is masked in the response.
- `GET/POST /account/two-factor.php`: status, start setup, confirm/enable, disable, and regenerate recovery codes.
- `POST /account/deactivate.php`: reauthenticate and soft-deactivate the account; sets existing `users.status` to `disabled`, timestamps it, revokes sessions, preserves history, audits, and sends a notice.
- `POST /auth/resend-verification.php`: public email+OTP resend uses generic responses and persistent email/IP limits; the authenticated legacy path retains single-use verification-link behavior.
- `POST /auth/verify-email.php`: consume either the existing hashed single-use link token or a registration OTP submitted in the request body.
- `POST /auth/request-password-reset.php`: generic password-reset request response.
- `POST /auth/reset-password.php`: consume the existing hashed password-reset token, set the new password, revoke sessions, audit, and notify.
- `POST /auth/verify-2fa.php`: complete the short-lived login challenge using TOTP or a one-time recovery code.

All account mutation endpoints use the existing secure session and require an exact configured `Origin` allowlist match. User IDs, roles, ownership, and status are read server-side. SQL uses PDO prepared statements. Rate limits are persisted in MySQL, not process memory.

## Security behavior and limitations

- New registrations create an unverified account and a six-digit, 10-minute email OTP. The OTP is generated with PHP cryptographic randomness, stored as a keyed HMAC in the existing `email_verification_tokens.token_hash`, invalidates prior outstanding verification entries, and is single-use. The OTP is sent in the email body only, never in a URL, response, database plaintext, or log.
- Registration does not create an `auth_sessions` row or session cookie. Password login checks `email_verified_at` before 2FA and returns `EMAIL_NOT_VERIFIED` without authenticating; the frontend offers the OTP screen and generic resend. Session lookup revokes existing session/challenge rows for unverified accounts, and successful link/OTP verification clears prior session/challenge rows so the user must sign in again.
- OTP verification is limited to five attempts per account per 15 minutes and 20 attempts per IP per 15 minutes. Sending is limited to one per email per minute, five per email per hour, and ten per IP per hour. Public resend responses do not reveal whether an email is registered or already verified. After verification, the user must sign in with their password; if 2FA is enabled, the existing TOTP challenge follows.
- Passwords use `password_hash()` and `password_verify()`. New/changed passwords require 12–128 characters with at least one letter and number. Passwords are not logged or emailed.
- Password reset tokens are stored as hashes, expire after one hour, are single use, invalidate earlier outstanding reset tokens, and revoke existing sessions.
- TOTP uses the maintained `pragmarx/google2fa` Composer package. Setup requires the current password and a valid TOTP before enabling. The seed is encrypted at rest using OpenSSL AES-256-GCM and a server-only key. Codes are checked with replay prevention.
- The QR image is generated locally in the frontend from the authenticated setup response; no external QR service receives the TOTP URI.
- Ten 128-bit recovery codes are shown once. Only SHA-256 hashes are stored; a successful code is consumed atomically.
- Login with 2FA enabled creates only a five-minute challenge cookie/database record before second-factor completion. Full auth session is established only after a valid code.
- Session rows store user-agent/device/browser/OS and IP server-side; the UI receives a masked IP and no cookie token or token hash.
- Account deactivation is soft: it disables sign-in and revokes sessions without deleting retained account/history data. Reactivation requires an administrator/support process; no self-service reactivation endpoint is provided.
- Preferences persist dark/light/system, sound toggle/volume, notification flags, language, and currency `USD`. One document-level delegated click listener plays the existing Web Audio click cue for actionable controls; explicit success/toggle/copy cues continue through the same engine. Sound respects cached/server preference and volume, and does not run for rendering, pointer movement, or scrolling. Staking/reward/referral notification toggles are stored preferences only; corresponding event-delivery systems are not currently implemented. Financial values are not converted beyond USD.
- Cookie-authenticated writes require the exact allowlisted browser Origin, in addition to HttpOnly/Secure/SameSite cookie behavior. No wildcard credentialed CORS is used.
- API responses include `Cache-Control: no-store`, `X-Content-Type-Options`, and `Referrer-Policy`; CSP is not emitted by this JSON API.

## Local test flow

1. Import migration 002 once into local `nodeconnect`.
2. Configure local `api/.env` with the keys above and a valid Resend API key/sender if testing email.
3. Start XAMPP Apache/MySQL and Vite (`npm run dev`).
4. Register a new account and verify it remains unauthenticated; use the emailed OTP, then sign in with the password and complete 2FA if enabled.
5. Try login before verification, invalid/expired/reused OTPs, five failed attempts, and resend cooldown/rate limits with a dedicated test mailbox.
6. Sign in, open `#profile`, edit the name, refresh, and verify persistence/read-only email/status.
7. Open `#settings`; test dark/light/system, sound ON/OFF, volume, notifications, language, and currency, then refresh and sign in again.
8. Change password with valid/invalid current password and confirmation cases; check that only other sessions are revoked.
9. Open Manage Sessions, revoke another session, and verify its cookie no longer authenticates.
10. Enable 2FA, scan the locally rendered QR, verify a code, store recovery codes safely, sign out and test TOTP/recovery login, then test replayed and used codes.
11. Test email-change confirmation and password-reset links for valid, expired, and used tokens. Check Resend delivery only after a real test email is received.
12. Test account deactivation using password plus exact `DEACTIVATE` confirmation; confirm sessions are invalidated and account/history rows are retained.
13. Recheck normal/admin routing, visitor activity API, Telegram notifications, and each existing wallet provider flow.

## Manual acceptance checklist

Profile:

- [ ] View the logged-in user's actual full name, email, role, status, and member date.
- [ ] Edit/save a valid full name, refresh, and verify it persists.
- [ ] Cancel an edit and verify the saved name returns.
- [ ] Confirm email is read-only.

Preferences:

- [ ] Select Dark, Light, and System; verify appearance immediately and after refresh/login.
- [ ] Toggle Sound Effects and change volume; delegated controls produce one click cue when enabled, none when disabled, and persisted volume changes gain.
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
- [ ] Register a new account; verify no session is created, valid OTP works once, and expiry, reuse, invalid attempts, resend cooldown, and login-before-verification are enforced.
- [ ] Verify legacy email links with valid, expired, and consumed tokens. Unverified users cannot access authenticated routes or complete stale 2FA challenges.
- [ ] Deactivate with password and exact `DEACTIVATE` confirmation; verify sessions are revoked and database history is retained.

Integration regression:

- [ ] Confirm normal users receive 403 for admin activity API and admins can still use admin dashboard/activity.
- [ ] Confirm visitor rows and Telegram notifications still work.
- [ ] Test each existing wallet provider and the Connect Wallet flow.
- [ ] Confirm Resend failures do not undo committed password/2FA/deactivation changes; verify Resend only after configuring a real Railway API key.
- [ ] Confirm no secrets are in browser requests/bundles or Git; check Secure HttpOnly cookie and CORS on HTTPS production domains.

Database-backed API scenarios require migration 002 first. No database migration was applied during implementation. Resend delivery cannot be claimed until valid server-side credentials are configured and a real message is received.

## Profile, email, referral, sound, and language additions

Migration 003 is already present in the local database and was not rerun or modified in this task. It is additive and uses `CREATE TABLE IF NOT EXISTS`; it does not edit migration 002, alter existing user rows, or touch visitor/admin tables. Confirm the same schema is deployed before using the existing Profile/email endpoints in another environment.

Profile pictures are limited to 2 MiB and JPEG, PNG, or WebP. PHP checks file upload status, `finfo` MIME, decoded image MIME, and dimensions (maximum 2048 by 2048 / 4,194,304 pixels); browser filename and extension are ignored. The image bytes and metadata are stored in the user's `user_profile_images` row, not in the Railway container filesystem. This keeps the image on the existing persistent MySQL service and avoids adding an unconfigured object-storage provider. The API only serves the image to the authenticated owner; no server filesystem path or original filename is exposed. Current PHP runtimes do not include GD, so images are bounded and dimension-checked but are not recompressed/resized. Database growth should be monitored if profile uploads become high-volume.

`GET/POST /account/profile.php` now returns the permanent referral ID and image version in addition to the safe profile fields. `POST/DELETE/GET /account/profile-picture.php` upload, remove, or serve only the current user's image. `POST /account/email-change.php` requires the current password and returns a generic response for unavailable addresses; `GET` exposes only that user's pending request status. `POST /auth/confirm-email-change.php` consumes a 30-minute, single-use token hash, then updates and verifies the email and sends a best-effort security notice to the former address. The existing Resend service and existing origin/rate-limit/audit helpers are reused. Delivery needs the existing server-side Resend configuration; no real email was sent during validation.

The authenticated header uses the same `UserAvatar` component and profile-image version as the Profile page. Its fallback is centered in a fixed line box and supports short, multi-part, punctuation-containing, and Unicode names. Uploaded image clipping and versioned URL behavior are unchanged. The avatar menu uses existing routes and the shared auth logout helper.

Migration `database/migrations/004_user_notifications.sql` adds account-owned notification records with a read timestamp and indexes for recent/unread queries. Local metadata confirms this migration has not been applied. Apply it manually once after migration 003 before enabling the new header notification API; no migration is run automatically. `GET /api/account/notifications.php` returns at most 50 newest records and unread count for the authenticated account. `POST` marks a single owned notification or all of that account's notifications read. The endpoint uses the existing session, exact Origin validation on writes, PDO prepared statements, and rate limiting; it does not accept a client-supplied user ID.

Only successful email verification, password change/reset, 2FA enabled/disabled, and confirmed email change events generate notifications, and only when the existing Activity Notifications preference is enabled. The feed stores safe localized message keys, not security-event metadata. Notification insert errors are swallowed after safe server logging to preserve the existing account/security action. Staking, rewards, and referrals are not generated because there are no corresponding real event producers.

Referral IDs live in `user_referrals`, use a random `NC-` plus 80-bit hexadecimal identifier with a unique database key, and are generated by PHP. New registrations get one in their registration transaction; existing accounts receive one on their first profile read. The current product has no implemented referral-link attribution or rewards engine, so the ID is displayed/copied but does not create referral accounting.

`src/lib/soundService.ts` is the single Web Audio engine for click, toggle, success, and copy cues. `installGlobalSoundInteractions()` installs one delegated click listener before React mounts, so dynamic controls are covered. Explicit sounds mark the same click event to prevent duplication; the referral copy and volume controls are marked as managed because they already use dedicated cues. It reads local cached preferences, receives authenticated server preferences and Settings changes, scales gain with volume, and does not start audio until an interaction. Browser playback can still be blocked by user-agent policy; the app swallows such optional audio failures.

Registration email verification uses the existing migration 002 `email_verification_tokens` and `security_rate_limits` tables; no migration was added and migrations 002/003 were not changed. The OTP hash is HMAC-SHA-256 keyed by the existing server-only `NODECONNECT_RATE_LIMIT_KEY`; production continues to fail closed if that key is absent. Resend uses the verified sender configuration on the PHP host only. Email change remains a separate password-confirmed 30-minute hashed-link flow in `email_change_requests`; 2FA remains TOTP-based with its existing encrypted secret and one-use recovery codes. 2FA security-notification sends are best-effort after the TOTP action and do not use registration OTP.

TOTP enrollment/login/recovery already existed in the PHP backend and uses the existing AES-256-GCM encrypted seed, newer-timestamp replay check, five-minute login challenge, attempt limits, and one-use hashed recovery codes. The Settings UI now presents enrollment, QR/manual setup, disable confirmation, and recovery-code reveal in native modal dialogs. The backend flow was reused, not replaced. Database-backed enrollment, actual authenticator scans, Resend notifications, and recovery login were not exercised in this validation pass.

The centralized `src/lib/i18n.ts` uses i18next/react-i18next with 25 locales. On 2026-09-27, all 548 keys were present in every locale with no extra keys or placeholder mismatches (`node scripts/check-i18n.mjs`). The eight registration-OTP strings were added across all locales. Arabic retains its RTL document direction and layout rules. Catalog parity does not replace native-speaker review of translation quality.

## Validation performed for these additions

- `npm run build` passed after frontend edits (TypeScript project build plus Vite production bundle).
- `php -l` passed for the added account/email endpoints, shared account support, registration, and preferences endpoint.
- Composer validation and `composer audit` passed with no advisories; npm install reported zero vulnerabilities.
- Browser locale checks passed for Spanish, Arabic, Simplified Chinese, Japanese, and Korean document language; Arabic remained RTL after refresh, and the local preference was restored to English.
- An earlier validation pass, before migration 003 was applied locally, saw HTTP 500 on authenticated Profile/email reads. Current read-only local schema metadata confirms the migration 003 tables now exist; this task did not exercise profile upload/email changes against them. Production migration state was not inspected.
- Production GETs at `https://api.canopynodeconnect.com` (without `/api`) returned HTTP 401 JSON for existing `/account/profile.php`, `/account/two-factor.php`, `/account/sessions.php`, and `/settings/preferences.php`. The new `/account/profile-picture.php` and `/account/email-change.php` paths returned Apache 404 because the new code has not been deployed. No production data was mutated and no email was sent.
- Changed PHP files passed `php -l`; all-workspace PHP lint, full upload/email/TOTP integration tests, actual recipient inbox confirmation, Railway environment inspection, and physical speaker/headphone testing remain outstanding. Local Resend credential/domain and HTTPS transport checks are described above; they did not send mail.
