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

## Profile, email, referral, sound, and language additions

Apply `database/migrations/003_profile_email_referral.sql` manually to the existing `nodeconnect` database after confirming migration 002 is present. The migration is additive and uses `CREATE TABLE IF NOT EXISTS`; it does not edit or rerun migration 002, alter existing user rows, or touch visitor/admin tables. This implementation did not apply the migration locally or in production. Profile and email endpoints that depend on its tables will return a safe server error until it has been applied.

Profile pictures are limited to 2 MiB and JPEG, PNG, or WebP. PHP checks file upload status, `finfo` MIME, decoded image MIME, and dimensions (maximum 2048 by 2048 / 4,194,304 pixels); browser filename and extension are ignored. The image bytes and metadata are stored in the user's `user_profile_images` row, not in the Railway container filesystem. This keeps the image on the existing persistent MySQL service and avoids adding an unconfigured object-storage provider. The API only serves the image to the authenticated owner; no server filesystem path or original filename is exposed. Current PHP runtimes do not include GD, so images are bounded and dimension-checked but are not recompressed/resized. Database growth should be monitored if profile uploads become high-volume.

`GET/POST /account/profile.php` now returns the permanent referral ID and image version in addition to the safe profile fields. `POST/DELETE/GET /account/profile-picture.php` upload, remove, or serve only the current user's image. `POST /account/email-change.php` requires the current password and returns a generic response for unavailable addresses; `GET` exposes only that user's pending request status. `POST /auth/confirm-email-change.php` consumes a 30-minute, single-use token hash, then updates and verifies the email and sends a best-effort security notice to the former address. The existing Resend service and existing origin/rate-limit/audit helpers are reused. Delivery needs the existing server-side Resend configuration; no real email was sent during validation.

Referral IDs live in `user_referrals`, use a random `NC-` plus 80-bit hexadecimal identifier with a unique database key, and are generated by PHP. New registrations get one in their registration transaction; existing accounts receive one on their first profile read. The current product has no implemented referral-link attribution or rewards engine, so the ID is displayed/copied but does not create referral accounting.

`src/lib/soundService.ts` synthesizes short sine-wave toggle, success, and copy cues only when an explicit action calls it. It reads the existing cached preferences and is updated from authenticated server preferences and Settings changes. Volume scales Web Audio gain; disabled sound and zero volume return without creating audio. Audio is never started on load, and browser-policy failures are swallowed as optional feedback. The embedded browser could not reliably deliver the Settings toggle interaction during validation, so audible playback and OFF/ON gain behavior still need a manual real-browser check.

TOTP enrollment/login/recovery already existed in the PHP backend and uses the existing AES-256-GCM encrypted seed, newer-timestamp replay check, five-minute login challenge, attempt limits, and one-use hashed recovery codes. The Settings UI now presents enrollment, QR/manual setup, disable confirmation, and recovery-code reveal in native modal dialogs. The backend flow was reused, not replaced. Database-backed enrollment, actual authenticator scans, Resend notifications, and recovery login were not exercised in this validation pass.

The centralized `src/lib/i18n.ts` uses i18next/react-i18next and lists English plus French, Spanish, Portuguese, German, Italian, Dutch, Russian, Ukrainian, Polish, Turkish, Arabic, Simplified Chinese, Traditional Chinese, Japanese, Korean, Hindi, Indonesian, Vietnamese, Thai, Bengali, Romanian, Greek, Slovak, and Zulu. Existing account preferences persist the selected code locally and through `/settings/preferences.php`; the server accepts only these locale codes. Arabic sets document direction to RTL and has shell/sidebar/profile/form/modal direction rules. The settings headings/theme/sound/security controls, shared navigation, and core Auth/Profile controls have curated translations. **This is not yet full-site localization:** large portions of Home, Dashboard, admin, wallet, and other page copy and many backend-generated errors remain English. The English fallback is used in production for such missing strings; development marks missing keys only when a component uses the translation hook. Do not represent every application page as fully translated until those catalogs and call sites are completed and reviewed by native speakers.

## Validation performed for these additions

- `npm run build` passed after frontend edits (TypeScript project build plus Vite production bundle).
- `php -l` passed for the added account/email endpoints, shared account support, registration, and preferences endpoint.
- Composer validation and `composer audit` passed with no advisories; npm install reported zero vulnerabilities.
- Browser locale checks passed for Spanish, Arabic, Simplified Chinese, Japanese, and Korean document language; Arabic remained RTL after refresh, and the local preference was restored to English.
- Local unauthenticated GETs for `/account/profile-picture.php` and `/account/email-change.php` returned HTTP 401 JSON. Authenticated Profile/email requests returned HTTP 500 because migration 003 had deliberately not been applied. No claim of successful database-backed profile/email/referral behavior is made until the migration is applied and those flows are exercised.
- Production GETs at `https://api.canopynodeconnect.com` (without `/api`) returned HTTP 401 JSON for existing `/account/profile.php`, `/account/two-factor.php`, `/account/sessions.php`, and `/settings/preferences.php`. The new `/account/profile-picture.php` and `/account/email-change.php` paths returned Apache 404 because the new code has not been deployed. No production data was mutated and no email was sent.
- Changed PHP files passed `php -l`; all-workspace PHP lint, full upload/email/TOTP integration tests, and manual audio playback remain outstanding.
