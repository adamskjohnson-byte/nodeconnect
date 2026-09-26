# NodeConnect Admin Activity Monitoring

This feature records two public-site events in MySQL and sends best-effort server-side Telegram alerts:

- `site_visit`: one visit per browser session, with a 30-second server duplicate window.
- `telegram_click`: clicks on the existing NodeConnect Telegram destination, with the same short duplicate window.

The browser sends only the event type, page path, and referrer. PHP derives the request IP, user agent, device, browser, operating system, and approximate IP location. Browser GPS is never requested.

## Database migration

The migration is [database/migrations/001_admin_activity.sql](../database/migrations/001_admin_activity.sql). It adds:

- `users.role`, defaulting to `user`, with `user` and `admin` values.
- `admin_activity`, including event, approximate location, device, browser, OS, page, referrer, metadata, and timestamp fields.

Run it through phpMyAdmin without replacing the existing database:

1. Start Apache and MySQL in XAMPP.
2. Open `http://localhost/phpmyadmin/`.
3. Select the existing `nodeconnect` database in the left sidebar.
4. Open the **Import** tab.
5. Choose `database/migrations/001_admin_activity.sql` from this project.
6. Confirm the selected database is `nodeconnect` and click **Import**.
7. After the migration succeeds, promote one existing account to admin by opening the **SQL** tab and running:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

Replace the example email with the existing administrator account. Do not create a frontend-only admin flag.

## Server configuration

Create the server-side `api/.env` file beside `api/bootstrap.php`, or expose the same values through the PHP process environment. The shared PHP bootstrap loads `api/.env` first and keeps the project-root `.env` as a fallback; process environment values take precedence. The `.env` file is ignored by Git.

```env
NODECONNECT_DB_HOST=127.0.0.1
NODECONNECT_DB_PORT=3306
NODECONNECT_DB_NAME=nodeconnect
NODECONNECT_DB_USER=root
NODECONNECT_DB_PASSWORD=
NODECONNECT_ALLOWED_ORIGINS=http://127.0.0.1:5174
NODECONNECT_GEOLOCATION_URL=https://ipwho.is
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_ADMIN_CHAT_ID=your_admin_chat_id_here
```

`ipwho.is` is used as a configurable, no-key IP geolocation provider. Change `NODECONNECT_GEOLOCATION_URL` later if production requirements call for another provider. If the provider or Telegram configuration is unavailable, activity is still stored and the visitor experience continues.

## PHP endpoints

- `POST /api/activity/track.php`: public, validated event ingestion for `site_visit` and `telegram_click`.
- `GET /api/admin/activity.php`: requires the existing HttpOnly auth session and `users.role = 'admin'`; returns summary cards and paginated activity rows without raw IP or user-agent fields.

The admin UI is available at `#admin` and `#admin/activity` inside the separate `AdminLayout` shell. Normal-user navigation does not expose Visitor Activity.

All SQL uses prepared statements. The tracking endpoint limits JSON requests to 4 KB, validates event types, and suppresses the same event/IP/page combination for 30 seconds. The React app also uses `sessionStorage` to avoid repeated `site_visit` events during one browser session.

## Telegram bot setup

1. Open Telegram and search for **BotFather**.
2. Start a conversation with BotFather.
3. Send `/newbot` and follow the prompts.
4. Copy the bot token BotFather gives you into the server-side `TELEGRAM_BOT_TOKEN` value. Never put it in React code or a `VITE_` variable.
5. Search for the new bot in Telegram and press **Start** to open a conversation.
6. Open this URL in a browser, replacing `TOKEN` with the bot token: `https://api.telegram.org/botTOKEN/getUpdates`.
7. Read the `message.chat.id` value from the update and put it in `TELEGRAM_ADMIN_CHAT_ID`.
8. Restart Apache/PHP or reload the environment so the values are available to PHP.
9. Use the visitor test steps below and confirm the message arrives on the administrator device.

For a group, add the bot to the group and use the group chat ID from `getUpdates` instead. Do not commit the token or chat ID.

## Local testing

1. Run the migration and promote an admin account as described above.
2. Start Apache and MySQL in XAMPP.
3. Start the frontend with `npm run dev` and open the Vite URL, normally `http://127.0.0.1:5174/`.
4. In a fresh browser session, open the home page. Inspect the Network panel for `POST /nodeconnect/api/activity/track.php`.
5. Refresh repeatedly. The same session should not create a notification storm.
6. Click the existing Connect Wallet Telegram link. Telegram should open at the unchanged destination while a second tracking request is sent best-effort.
7. Sign in as the promoted admin and open `#admin/activity`. The page must load MySQL records and summary counts.
8. Sign in as a normal user and request `GET /api/admin/activity.php` directly. It must return HTTP 403. An unauthenticated request must return HTTP 401.
9. Temporarily remove or invalidate the Telegram values. Confirm records still appear in the admin page and the website remains usable.
10. Test the responsive dashboard at 320px, 375px, 480px, 768px, 1024px, 1280px, 1440px, and 1920px. The activity table scrolls inside its own panel on narrow screens rather than creating page overflow.

Do not call Telegram delivery fully verified until valid credentials are configured and a real notification is received.

## Production notes and limitations

- Set production database credentials, allowed origins, geolocation URL, Telegram token, and chat ID through the hosting environment.
- Serve the PHP API over HTTPS and use a production domain in `NODECONNECT_ALLOWED_ORIGINS`.
- Add operational log monitoring for PHP errors and Telegram delivery failures.
- IP geolocation is approximate. It may identify a VPN, proxy, mobile carrier gateway, or hosting provider rather than a person's actual location.
- Private/local IP addresses are intentionally not sent to the geolocation service and display as `Unknown`.
- The first implementation stores no GPS data and no raw IP in the admin response or Telegram message. Raw IP and user-agent values remain server-side in `admin_activity` for operational use.
