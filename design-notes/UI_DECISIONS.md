# NodeConnect UI Decisions

## Current Status

The project is currently in the UI/UX implementation phase.

## Source of Truth

The NodeConnect design reference image is the primary visual source of truth.

## Development Rule

Do not redesign the approved reference unnecessarily.

Changes to layout, spacing, colors, typography, or components should be recorded here when a design decision is made.

## Current Decisions

- React + Vite + TypeScript
- UI/UX first
- No backend functionality during the current phase
- No wallet connection functionality yet
- No blockchain functionality yet
- Provided SVG icons should be reused where appropriate
- Main NodeConnect reference screenshot is the visual source of truth

## Implementation Decisions

- The homepage is split into focused React components under `src/components/`, with `Home` composing the page flow.
- The official reception contact email `coinbureau940@gmail.com` is displayed in the landing page footer’s existing contact/resources area using a `mailto:` link, with the copy “Official Reception” and no changes to the approved header, hero, color palette, or logo.
- The desktop composition uses an 870px content measure to match the supplied reference proportions; cards and feature columns use grid layouts rather than fixed canvas positioning.
- The hero network and token allocation ring are CSS decorations so they remain responsive without adding a chart dependency.
- On small screens, the primary navigation becomes an opened/closed menu, the hero graphic moves below the copy, feature columns become a two-by-two grid, and the staking/tokenomics/footer layouts stack.
- Wallet, staking, claim, newsletter, and navigation controls are intentionally visual-only. No financial, wallet, account, or blockchain functionality is connected.
- The supplied SVGs were inspected individually. Used assets include the brand hex, shield, leaf, network, bolt, building, globe, chat, send, list, and security motifs; empty numbered SVG files remain unused.

## Visual QA Notes

- The desktop content measure is 922px with a 13px minimum side gutter at the reference-sized viewport; this preserves the broad, centered composition without a fixed canvas.
- Desktop hero height is 380px and the headline uses a gentler fluid scale so its three intentional lines remain stable from tablet through large desktop.
- Mobile retains 16px gutters, a two-by-two feature grid, stacked cards, and a compact footer. The navigation opens as an in-flow overlay below the 58px mobile header.
- Visual QA was completed at 320px, 375px, 480px, 768px, 1024px, 1280px, 1440px, and 1920px. The project remains UI-only with no wallet, blockchain, staking, claim, or submission functionality.

## Icon Fidelity Correction

- Feature cards now use the verified supplied assets: shield `Icon-8.svg`, leaf `Icon-18.svg`, connected nodes `Icon-17.svg`, and community gift `Icon-16.svg`.
- The missing staking center icon was restored with the supplied bolt `Icon-14.svg`; the audit banner now uses the shield-check `Icon-9.svg`.
- Token use-case icons were aligned to their visible concepts using `Icon-6.svg`, `Icon-17.svg`, `Icon.svg`, and `Icon-22.svg`. No supplied SVG files were modified.

## Roadmap Page

- Roadmap uses the existing header/footer and design tokens, with a dedicated `Roadmap.tsx` page and `roadmap.css` stylesheet.
- Desktop uses a centered alternating timeline with state-specific nodes; mobile collapses cards to the right of one vertical line to preserve readability.
- The Roadmap CTA uses the supplied paper-plane asset as a Telegram visual. All navigation and CTA controls remain harmless UI-only placeholders.

## Roadmap QA

- Verified the Roadmap route at `#roadmap` and homepage return at `#home`.
- Checked the layout at 320px, 375px, 480px, 768px, 1024px, 1280px, 1440px, and 1920px CSS widths. Narrow layouts use a single-column timeline and retain the central line without horizontal overflow.

## Transaction History

- Added `TransactionHistory.tsx` and `history.css` using the existing NodeConnect visual system.
- Desktop keeps the compact five-column activity table from the reference; mobile transforms each row into a readable two-column activity card without horizontal scrolling.
- Summary cards and table controls are visual-only. No transaction data source, export, filter, wallet, or blockchain behavior was added.

## Staking Page

- Added `Staking.tsx` and `staking.css` using the established NodeConnect palette, typography, header, footer, surfaces, and controls.
- The rewards history visual is a lightweight inline SVG curve; no chart dependency or live data was introduced.
- Desktop uses the reference two-column dashboard composition. Mobile stacks the sections and retains readable pool rows and form controls.
- All staking values and controls are static UI content. No wallet, transaction, calculation, or backend behavior was added.

## Tokenomics Page

- Added `Tokenomics.tsx` and `tokenomics.css` using the established NodeConnect visual language.
- The shared Header owns a reusable UI-only wallet chooser modal so the same visual flow is available from every page.
- The dialog uses CSS for the wallet mark and supplied icon motifs for provider rows because no provider-brand logo set exists in the workspace. Close, Go Back, and provider buttons remain harmless presentation controls only.
- Implemented `ConnectWallet.tsx` as a standalone hash-routed screen rather than a modal overlay. It reuses the wallet visual language but has its own branded header, no primary navigation, no normal footer, grouped provider rows, and stacked bottom actions on mobile.
- The intro icon is recreated with local CSS geometry for the reference person/connection motif; the supplied icon set contains no matching wallet-provider artwork. The screen otherwise retains the existing supplied branding/assets and UI-only scope.
- Added dedicated local provider assets for MetaMask, WalletConnect, Coinbase Wallet, Trust Wallet, Phantom, Solflare, and Rabby Wallet based on the pasted reference artwork. These assets are presentation-only and do not connect to providers.

## Wallet Connection Flow

- Wallet cards use shared configuration data and a single `WalletFlow` state machine instead of seven duplicated screens.
- The connecting state uses a cancellable React timer of approximately 2000ms, followed by wallet-specific copy and status handling.
- Supported browser APIs are used directly: EIP-1193 for injected EVM providers, Phantom/Solflare injected Solana providers. WalletConnect/Reown and Coinbase SDK integration require project configuration/dependencies and therefore show an honest unavailable/configuration state.
- The current project remains UI-first and does not add SDK dependencies or backend behavior.

## Auth Page

- The approved `Auth.tsx` page and `auth.css` visual system were preserved while Create Account and Sign In were connected to the PHP/MySQL authentication API.
- Registration uses `users.password_hash` with PHP `password_hash`; login uses `password_verify` and updates `last_login_at`.
- The intended flow is `HOME -> AUTH -> CONNECT WALLET`; the existing wallet chooser and wallet-specific flows remain separate and unchanged.
- Authentication uses HttpOnly cookie sessions backed by hashed records in `auth_sessions`; logout invalidates the record and cookie.
- Wallet modal refinement follows the supplied portrait reference: grouped providers, enlarged touch rows, full-width mobile presentation, and vertically stacked footer actions.
- The token distribution ring uses a native CSS conic gradient with the reference allocation colors; allocation rows remain readable and stack below the ring on mobile.
- Supply, burn, progress, and distribution content are static UI-only values. No financial, blockchain, or token functionality was introduced.

## Dashboard Page

- Added `Dashboard.tsx` and `dashboard.css` as a dedicated UI-only `#dashboard` route.
- Dashboard is the intended destination after future authentication, but no authentication guard or login behavior is implemented.
- Dashboard uses static zero values, professional empty states, and presentation-only navigation. It does not connect to a backend, API, database, wallet, blockchain, staking calculations, or referral calculations.
- The responsive layout uses a persistent desktop sidebar, a mobile navigation drawer, stacked mobile cards, and a two-column desktop content rhythm from the existing NodeConnect visual system.

## Application Structure

- Public Home is limited to the `#home` experience plus the existing Auth entry action; public navigation no longer links to internal pages.
- `#auth` remains the UI-only entry point for the future `HOME -> AUTH -> DASHBOARD` flow.
- `DashboardLayout` is the single reusable shell for `#dashboard`, `#my-nodes`, `#staking`, `#tokenomics`, `#roadmap`, `#transaction-history`, `#profile`, and `#settings`.
- The shared shell owns the internal sidebar, active navigation, top bar, and mobile drawer. Tokenomics and Roadmap were added to the internal navigation; Transactions continues to map to `#transaction-history`.
- Approved Staking, Tokenomics, Roadmap, and Transaction History implementations use an embedded mode that preserves their content and page-specific CSS while omitting redundant standalone site navigation inside the shell.
- Connect Wallet remains standalone at `#connect-wallet`; its seven-provider list and wallet-specific flow are not part of the internal shell restructure.
- The separation remains hash-based, while protected internal routes now check the server-side authenticated session. No wallet, blockchain, staking, node, or financial backend behavior was introduced.

## Profile and Settings

- Profile and Settings are internal `#profile` and `#settings` pages rendered through the existing `DashboardLayout`; no duplicate sidebar or mobile navigation was introduced.
- Profile follows the Dashboard surface, border, typography, and green/cyan accent system with static account and wallet states. Its Connect Wallet action reuses `#connect-wallet`.
- Settings uses scoped cards for Appearance, Sound, Notifications, Security, and Account. Theme, sound, volume, notification, and select controls are local UI state only.
- Security and destructive account actions are deliberately non-functional. No persistence, backend, API, authentication, database, or session behavior was added.

## Authentication Backend

- Added `api/bootstrap.php` plus `api/auth/register.php`, `login.php`, `logout.php`, and `me.php` for PDO database access, safe JSON responses, CORS, HttpOnly session cookies, and activity logging.
- The frontend uses `VITE_API_BASE_URL`; local XAMPP defaults and PHP database variables are documented in `.env.example`.
- The existing `schema.sql` remains the source for `nodeconnect` authentication tables. No duplicate tables or database were introduced.

## My Nodes

- Added `MyNodes.tsx` and `my-nodes.css` as a UI-only `#my-nodes` internal page using the existing Dashboard shell and visual system.
- The page uses static zero/empty values for node statistics, infrastructure status, activity, health, and rewards. No real node data is fabricated.
- Node activation is intentionally disabled until future backend, wallet, payment, and node deployment requirements are defined.

## Account Extensions

- Profile photo controls, verified email change, and referral ID are presented inside the existing Profile surface; the shared dashboard avatar uses the same server-owned image version and fallback treatment.
- TOTP setup and recovery-code confirmation use native modal dialogs and retain the existing PHP security flow.
- Sound effects use restrained synthesized Web Audio cues; no external or copyrighted audio assets are used.
- The selected interface locale follows saved account preferences, with Arabic RTL layout rules. The approved NodeConnect logo, admin shell, wallet connection behavior, and visitor-monitoring flow remain unchanged.