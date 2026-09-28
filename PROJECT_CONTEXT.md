# NodeConnect - Project Context

## Project Name

NodeConnect

## Current Development Phase

UI/UX implementation with functional authentication foundation.

The NodeConnect Auth page now communicates with the local PHP/MySQL backend. Wallet, blockchain, staking, node, referral, and financial functionality remain outside the current scope.

The focus is strictly:

- Layout
- UI components
- Styling
- Responsive design
- Navigation appearance
- Buttons
- Forms as visual components only
- Animations and transitions where appropriate

## Tech Stack

Frontend:

- React
- Vite
- TypeScript
- CSS

Deployment target:

- Vercel

## AI Development Assistant

GitHub Copilot in VS Code.

## Design Source

The design screenshots inside:

design-reference/

are the primary visual reference.

The main NodeConnect reference screenshot should be reproduced as closely as possible.

Do not unnecessarily redesign sections.

## Assets

SVG icons are stored in:

src/assets/icons/

Use the provided icons where they match the design.

Do not replace provided icons with unrelated icon libraries unless necessary.

## Visual Design Rules

The design has a dark Web3/technology aesthetic.

## Design Color Palette

The UI must preserve the NodeConnect design palette.

### Core Colors

- Background black: #000000
- Primary neon green: #00FF88
- Secondary green: #02F382
- Primary white: #FFFFFF
- Muted gray: #A3A3A3
- Primary dark blue: #191F2F

### Dark Surface Colors

- #0F172A
- #0C1322
- #232A3A
- #323949
- #003640
- #40215D

### Cyan / Blue Colors

- #4CD7F6
- #DCE2F7

### Additional Neutral Colors

- #6B7280
- #988CA0
- #E5E7EB

### Purple / Pink Accent Colors

- #DDB8FF
- #FFB0CD

### Important Opacity Variations

- #FFFFFF at 10%
- #FFFFFF at 0.2%
- #00FF88 at 20%
- #4CD7F6 at 15%, 0%, 50%, 40%, 20%, and 0%
- #141B2B at 50%
- #191F2F at 60%, 50%, and 40%
- #232A3A at 50% and 0%
- #DDB8FF at 70%
- #000000 at 60%

### Gradient Rules

Use gradients and glows only where they appear in the design reference.

Important gradient combinations include:

- #00FF88 → #02F382
- Transparent #00FF88 (20%) → #00FF88
- #232A3A (50%) → #232A3A (0%)

Use #4CD7F6 with opacity variations for subtle radial cyan glows.

## Development Rules

1. Preserve the approved design structure.
2. Do not add random sections.
3. Do not invent functionality.
4. Build reusable React components.
5. Use TypeScript properly.
6. Keep components organized.
7. Keep styling maintainable.
8. Make the UI responsive.
9. Use the reference screenshots as the visual source of truth.
10. Complete the UI/UX before implementing backend functionality.

## Current Progress

- Project planning: Complete
- Figma integration: Not being used
- Design references: To be added
- SVG icons: To be added
- React UI implementation: First complete responsive pass

## Implemented UI

- Vite + React + TypeScript application shell
- Header with responsive navigation menu
- Hero, feature, staking, audit, tokenomics, claim, and footer sections
- CSS network graphic and token allocation donut
- UI-only wallet, staking, claim, and newsletter controls with no backend behavior
- Production build verified with `npm run build`

## Development Notes

The page uses the supplied black, navy, neon green, cyan, lilac, and pink palette. Layout is fluid with an 870px desktop content measure and dedicated mobile stacking rules below 700px. The local Vite server may select port 5174 when port 5173 is already occupied.

## Visual QA Pass

- Refined the desktop content gutter and maximum measure to better match the reference composition.
- Reduced the desktop hero height and adjusted section rhythm so the feature, staking, and token sections arrive at the reference proportions.
- Corrected hero headline shrink-to-fit behavior and desktop fluid scaling so the headline remains three lines.
- Verified the rendered page at 320px, 375px, 480px, 768px, 1024px, 1280px, 1440px, and 1920px. No horizontal overflow remains at tested mobile widths.
- Final `npm run build` and TypeScript diagnostics pass.

## Icon Fidelity Correction

- Corrected feature mapping: `Icon-8.svg` shield for Decentralized & Secure, `Icon-18.svg` leaf for Sustainable By Design, `Icon-17.svg` connected nodes for Real World Utility, and `Icon-16.svg` community gift for Community Rewards.
- Restored the staking illustration center symbol with `Icon-14.svg` and corrected the audit banner to use `Icon-9.svg` shield-check.
- Corrected clearly identifiable token use-case assets to storage/server `Icon-6.svg`, connected nodes `Icon-17.svg`, globe `Icon.svg`, and enterprise building `Icon-22.svg`.

## Roadmap Page

- Added the UI-only Roadmap page at `#roadmap` with a shared header/footer, centered hero, alternating development timeline, phase states, and community CTA.
- Added lightweight hash-based page switching while preserving the homepage at `#home`.
- Roadmap cards alternate on desktop and become a single-column timeline on mobile. Global horizontal overflow is guarded for narrow viewports.

## Roadmap Implementation

- Added `src/pages/Roadmap.tsx` and `src/styles/roadmap.css`.
- Added lightweight hash routing in `App.tsx` for `#roadmap` and preserved the homepage at `#home`.
- Reused the existing Header, Footer, palette, typography, button language, and supplied paper-plane asset for the community CTA.
- Roadmap controls are UI-only placeholders; no external integrations or application functionality were added.

## Transaction History Page

- Added the UI-only Transaction History page at `#transaction-history` with summary metrics, network status, activity table, status pills, and pagination controls.
- Added responsive mobile table cards while preserving the dense desktop table composition.
- Reused the shared Header/Footer, design tokens, and supplied shield, claim, vote, and chart icons. Export, filter, pagination, and transaction links remain placeholders.

## Staking Page

- Added the UI-only Staking page at `#staking` with portfolio metrics, rewards history chart, active staking pools, and Quick Stake form.
- Reused the shared Header/Footer and supplied network, shield, and leaf assets. Pool actions, selectors, amount input, and Confirm Stake remain visual placeholders.
- Staking layout uses two columns on desktop and stacks the portfolio, pools, and Quick Stake panel on mobile without horizontal overflow.

## Tokenomics Page

- Added the UI-only Tokenomics page at `#tokenomics` with supply metrics, circulating-supply progress, burned-token state, and token distribution visualization.
- Reused the shared Header/Footer and existing design tokens. The donut and all values are static visual UI with no live supply or financial calculations.

## Connect Wallet UI

- Added a shared UI-only wallet provider modal opened by the existing Connect Wallet button on every page.
- The modal includes the reference provider list, Popular badge, close and Go Back controls, responsive full-screen mobile sizing, and supplied neutral icon assets.
- Provider rows do not connect wallets or request permissions; no wallet, account, blockchain, or financial functionality was added.

## Wallet Modal Refinement

- Rebuilt the wallet chooser to match the supplied reference: branded top bar, centered wallet introduction, Popular Wallets and Other Wallets groups, larger provider rows, Popular badge, and stacked Web3 Wallet?/Go Back actions.
- The modal now presents seven static provider rows and remains responsive without changing the underlying page layouts.

## Dedicated Connect Wallet Page

- Converted the wallet chooser into the dedicated `#connect-wallet` screen described by the supplied reference.
- The normal site header button now navigates to the screen, which uses a special NodeConnect/X header and intentionally omits normal site navigation and footer.
- The page presents exactly seven static providers in Popular Wallets and Other Wallets groups. Close and Go Back return through browser history with a `#home` fallback.
- Refined the dedicated screen's intro mark to the reference user/connection symbol and made the close control a circular outlined action.
- Replaced the seven provider rows' generic feature icons with dedicated local provider SVG artwork matching the pasted reference marks.

## Wallet Connection Flow

- Added reusable `walletConfig.ts` and `WalletFlow.tsx` components for all seven providers.
- Provider selection now enters a real 2-second `CONNECTING...` state, then attempts the legitimate injected provider where supported.
- EVM wallets use standard EIP-1193 `eth_requestAccounts`; Phantom and Solflare use their injected Solana providers.
- WalletConnect reports that Reown/WalletConnect project configuration is required, while missing providers and user rejection have explicit UI states.
- Success displays only a shortened public address. No seed phrases, private keys, passwords, or fake confirmations are requested or shown.

## Auth Page

- The approved `#auth` UI now supports real registration and sign-in through the local PHP/MySQL API; its visual design remains unchanged.
- Registration writes normalized email, full name, and a `password_hash` to `users`; plaintext passwords are never stored or returned.
- Login uses `password_verify`, updates `users.last_login_at`, and establishes a hashed server-side session record in `auth_sessions`.
- Registration creates an unverified account, sends a short-lived six-digit email OTP, and creates no authenticated session. Verification returns the user to sign-in; verified password login then routes to Dashboard (or Admin for an admin user).
- Password login, session lookup, and stale 2FA challenge completion reject unverified accounts. Unverified session/challenge rows are revoked, and verification clears any prior session/challenge rows so the user must sign in and complete 2FA again.
- Logout invalidates the server-side session and clears the HttpOnly cookie. `/api/auth/me.php` returns safe authenticated-user data only.

## Dashboard Page

- Added the UI-only `#dashboard` page as the intended destination after future authentication.
- Dashboard values, empty states, navigation, notifications, profile details, staking, referrals, and quick actions use static placeholder UI only.
- Dashboard does not connect to a backend, API, database, wallet, blockchain, or authentication system.
- The Dashboard uses the established NodeConnect black, navy, neon-green, cyan, typography, borders, and restrained glow language.
- Responsive behavior was designed for mobile through desktop, including a mobile navigation drawer and stacked dashboard sections.

## Application Areas

- Public area: `#home` only. The public Header and Footer no longer expose Staking, Tokenomics, Roadmap, or Transaction History destinations.
- Auth area: `#auth`, with PHP/MySQL registration, login, logout, safe session lookup, and frontend protected-route checks.
- Internal area: `#dashboard`, `#my-nodes`, `#staking`, `#tokenomics`, `#roadmap`, `#transaction-history`, `#profile`, and `#settings`.
- `DashboardLayout` is the shared internal website shell. It owns the sidebar, top bar, active navigation state, and mobile drawer for all internal pages.
- Staking, Tokenomics, Roadmap, and Transaction History reuse their approved existing content and styles in embedded mode; only their redundant standalone Header/Footer are omitted inside the internal shell.
- Connect Wallet remains a standalone `#connect-wallet` route with the existing seven providers and wallet-specific flows unchanged.
- Internal navigation remains hash-based. Protected internal routes require a valid server-side authentication session; backend integration is limited to authentication.

## Profile and Settings Pages

- `#profile` and `#settings` use the shared `DashboardLayout` and preserve the established NodeConnect visual system.
- Profile reads the authenticated account from `/account/profile.php`, supports validated full-name editing, keeps email read-only, and reflects database role/status. Its Connect Wallet action remains unchanged.
- Settings reads and persists per-user theme, sound/volume, notification flags, language, and currency through `/settings/preferences.php`.
- Password changes, active-session listing/revocation, TOTP enrollment/login/recovery codes, verification resend, and soft account deactivation use the existing PHP cookie-session backend and additive endpoints.
- Account security implementation, migration 002, Resend configuration, limitations, and manual testing are documented in `docs/PROFILE_SETTINGS.md`.

## Authentication Backend

- Added PHP endpoints under `api/auth/`: `register.php`, `login.php`, `logout.php`, and `me.php`, sharing PDO/CORS/session logic from `api/bootstrap.php`.
- The database is `nodeconnect` using the existing `users`, `auth_sessions`, `password_reset_tokens`, and `auth_activity` schema tables.
- Authentication sessions use a cryptographically random token in an HttpOnly cookie while only its SHA-256 hash is stored in `auth_sessions`. Migration 002 adds non-secret client metadata for session management.
- Local configuration can use the XAMPP defaults in `.env.example`; production deployments should provide the same `NODECONNECT_*` variables through the server environment.

## My Nodes Page

- Added the UI-only `#my-nodes` page inside the shared `DashboardLayout` shell.
- My Nodes provides static node statistics, empty states, infrastructure information, activity, health, and help sections without fabricating node data.
- `Activate a Node` is intentionally non-functional; no wallet, payment, blockchain, backend, API, uptime, rewards, or node deployment behavior was added.
- Dashboard My Nodes links and the internal sidebar now navigate to `#my-nodes`.

## Admin Activity Monitoring

- Added the MySQL migration at `database/migrations/001_admin_activity.sql`. It adds the `users.role` authorization field and the `admin_activity` event table without replacing existing data.
- Added public `POST /api/activity/track.php` and protected `GET /api/admin/activity.php` endpoints. The protected endpoint requires the existing server-side session and `users.role = 'admin'`.
- Added session-deduplicated `site_visit` tracking and best-effort `telegram_click` tracking using `sendBeacon`/keepalive fetch. The existing Telegram destination is unchanged.
- Added `#admin/activity` using `DashboardLayout`, with MySQL-backed summary cards and recent activity records.
- IP location is approximate and server-side through the configurable `NODECONNECT_GEOLOCATION_URL` provider. Browser GPS is never requested.
- Telegram secrets remain server-side in `.env`; configuration and phpMyAdmin/BotFather instructions are documented in `docs/ADMIN_ACTIVITY.md`.
- Admin monitoring now has a separate `AdminLayout` application shell at `#admin` and `#admin/activity`. Admin login defaults to `#admin`; normal users default to `#dashboard`, and protected admin destinations are preserved through the auth flow.

## Profile, Settings, and Account Security

- Added manual one-time migration `database/migrations/002_account_security.sql` for user preferences, email verification tokens, TOTP factors/recovery codes/challenges, security audit/rate-limit tables, session metadata, and account deactivation timestamp. It reuses `password_reset_tokens`; it does not alter `admin_activity`.
- `Profile.tsx` loads authenticated user data through `/account/profile.php`, supports validated full-name editing, keeps email read-only, reflects actual role/status, and can request verification email resend.
- `Settings.tsx` persists account preferences through `/settings/preferences.php`, applies dark/light/system theme, supports password changes, active-session revocation, TOTP setup/login/disable/recovery codes, verification resend, and soft account deactivation.
- Auth retains the PHP `auth_sessions` architecture and role routing. Email verification is required before login and protected session access; the email OTP step does not authenticate a user or replace password/2FA checks.
- Resend runs only in PHP through `api/email_service.php`; configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `RESEND_FROM_NAME` only on the PHP host. TOTP seed encryption and persistent rate limits use separate server-side keys.
- Composer locks `pragmarx/google2fa`; Railway's Docker build installs locked PHP dependencies. Setup, migration, limitations, and test steps are in `docs/PROFILE_SETTINGS.md`.
- Apply migration 002 manually and once in local/Railway MySQL before testing these account endpoints. No database migration was run automatically.

## Account Extensions (2026-09)

- Migration `database/migrations/003_profile_email_referral.sql` adds owner-scoped MySQL profile-image storage, single-user pending email-change state, and unique referral IDs. It was already present in the local database and was not rerun or modified for this work.
- Profile image bytes use persistent Railway MySQL rather than the ephemeral PHP container filesystem. Uploads accept JPEG/PNG/WebP, max 2 MiB and 2048px dimensions; resizing is not configured because the current PHP image lacks GD.
- Email change reuses the existing password/session/origin/rate-limit/audit/Resend infrastructure. The current address changes only after a hashed, expiring, single-use confirmation token is redeemed.
- Existing referral attribution/rewards do not exist. A stable random referral ID is assigned at registration or on the first profile load for an existing user.
- Existing AES-256-GCM TOTP, login challenge, replay prevention, and recovery-code backend was retained; the Settings enrollment/disable/recovery interface now uses modal steps.
- `i18next`/`react-i18next` provide 25 locales and Arabic RTL handling with saved account/local preferences. On 2026-09-27, all 548 keys passed catalog parity/placeholder checks. See `docs/PROFILE_SETTINGS.md` for validation scope and translation-review limits.
- Sound uses one Web Audio engine and document-level delegated click listener for dynamic actionable controls; saved toggle/volume apply globally. Explicit success, toggle, and copy cues share the same engine and duplicate click cues are suppressed.

## Mandatory Email Verification and Global Sound (2026-09)

- Registration sends a six-digit numeric OTP by Resend, expires it after 10 minutes, stores only a keyed HMAC in the existing `email_verification_tokens` table, invalidates prior verification entries, and does not call `establishSession`.
- OTP verification consumes the hashed entry once and marks `users.email_verified_at`; it does not create a session. The user signs in with their password afterward and completes the existing TOTP challenge if enabled.
- Login with valid credentials but an unverified email sends an OTP when send limits allow and returns `EMAIL_NOT_VERIFIED`. `currentUser()` and the 2FA completion endpoint also reject unverified accounts so an older session/challenge cannot bypass verification.
- Public resend accepts the email in the POST body only, returns a generic non-enumerating response, and enforces per-email one-per-minute/five-per-hour and per-IP hourly limits. OTP checks are limited to five per account per 15 minutes and 20 per IP per 15 minutes. No OTP is placed in a URL, database plaintext, or API response.
- No additional database migration was required: local metadata confirmed migration 002's `email_verification_tokens`, `security_rate_limits`, and `security_events`, and migration 003's profile/email/referral tables. Migrations 002/003 were not modified or rerun.
- Resend diagnostics now log request ID, timestamp, endpoint, destination domain, HTTP status, cURL errno/error, and sanitized provider error type/message; they do not log credentials, message bodies, full addresses, OTPs, or tokens. The local configured key returned HTTP 200 from Resend's read-only domains endpoint and the sender domain status was `verified`. No message was sent or received in this validation.
- Central sound delegation uses the existing `soundService.ts`; click sounds honor persisted sound/volume settings, explicit interactions avoid duplicate click cues, and copy keeps its dedicated two-tone cue. Browser QA measured one delegated cue, no cue after turning sound off, and lower oscillator gain at reduced volume; preferences were restored to ON/70.
- The Auth OTP screen uses translated content in all 25 locales and masks the displayed email. `PROJECT_CONTEXT.md` and `docs/PROFILE_SETTINGS.md` distinguish the local checks from outstanding real inbox, full TOTP, production Railway, and deployment validation.

## Authenticated Header Notifications and Avatar (2026-09)

- The shared authenticated dashboard header keeps the current NodeConnect branding and uses `UserAvatar` for the account profile picture or name-derived initials. The fallback uses deterministic flex centering and trims punctuation/whitespace while supporting Unicode letters; uploaded images remain circular and `object-fit: cover`.
- The avatar opens a keyboard-accessible account menu with the current name/email, existing `#profile` and `#settings` routes, and shared `logoutAndNavigate()` behavior. Account and notification panels are mutually exclusive and close on outside click or Escape.
- Prior to this work, notification settings were preferences only and there was no stored notification feed. Additive migration `database/migrations/004_user_notifications.sql` creates account-owned records with read state and recent/unread indexes. Apply it manually after 003; local schema check confirms it is not yet applied.
- `GET /api/account/notifications.php` returns the current authenticated user's newest 50 rows and unread count. `POST` marks one owned row or all current-user rows read. The API derives identity from the existing session and never accepts a frontend user ID.
- Existing `accountAudit()` emits only safe summaries for email verification, password change/reset, 2FA enable/disable, and email change, gated by the existing `activity_notifications` preference. No audit metadata or secret values are copied. Notification insertion is best-effort; no staking/reward/referral notifications are fabricated because no such event producers currently exist.

## First-Login Welcome Email (2026-09)

- New registrations set `users.welcome_email_eligible_at`; existing user rows remain ineligible. The manually applied additive migration `database/migrations/005_welcome_email.sql` adds eligibility, claim, and sent timestamps; it sends no email and does not backfill existing accounts.
- `sendWelcomeEmailIfNeeded()` runs only after a password-only login session commit or after successful TOTP/recovery verification and session commit. It also checks active status and `email_verified_at`; registration, OTP verification, password acceptance before 2FA, failed 2FA, email changes, and refreshes do not send.
- A conditional atomic claim serializes concurrent first-login attempts. Resend acceptance is required before `welcome_email_sent_at` is set. Failed sends release the claim for a future successful-login retry; abandoned claims can be reclaimed after five minutes. Welcome email failure is best-effort and never reverses a successful login.
- The email uses the existing server-side Resend service and `NODECONNECT_FRONTEND_URL`, an inline NodeConnect-branded HTML template, and the user's verified email/name. No notification or optional preference is used for this mandatory transactional welcome message.