# Railway PHP API Deployment Preparation

This project keeps the existing React frontend on Vercel and the existing PHP API on Railway. This document prepares deployment only; it does not deploy services or alter either database.

## Runtime

Railway should deploy the repository as a Docker service using the root `Dockerfile`. The image uses `php:8.3-apache-bookworm`, installs `pdo_mysql` and `curl`, and verifies `PDO`, `pdo_mysql`, `curl`, and `openssl` are loaded. The PHP image supplies the OpenSSL extension and CA certificate bundle needed for HTTPS calls.

The container serves `/var/www/html/api` as Apache's document root. `railway-entrypoint.sh` reads Railway's numeric `PORT`, updates Apache's listen and virtual-host ports, and starts Apache in the foreground. No local port is baked into the runtime; `8080` is only a fallback for local container runs without `PORT`.

No `.htaccess`, `index.php`, rewrite router, Composer setup, or framework is present or needed. Each API endpoint is a directly addressable PHP file. Serving `api/` as the document root gives these production paths:

- `https://api.canopynodeconnect.com/auth/login.php`
- `https://api.canopynodeconnect.com/auth/register.php`
- `https://api.canopynodeconnect.com/auth/me.php`
- `https://api.canopynodeconnect.com/auth/logout.php`
- `https://api.canopynodeconnect.com/activity/track.php`
- `https://api.canopynodeconnect.com/admin/activity.php`

The XAMPP URL includes `/nodeconnect/api` because Apache serves the project from its local `htdocs` subdirectory. That prefix is not embedded in PHP endpoint logic. With the Railway API document root above, configure the future Vercel build variable as:

```env
VITE_API_BASE_URL=https://api.canopynodeconnect.com
```

This keeps the existing frontend URL construction unchanged. Do not use a `/api` suffix with this container's document-root configuration.

## Railway variables

Set variables on the Railway PHP service. Use Railway's variable-reference picker for the Railway MySQL service rather than copying database credentials manually. For a MySQL service named `MySQL`, the references are typically:

```env
NODECONNECT_DB_HOST=${{MySQL.MYSQLHOST}}
NODECONNECT_DB_PORT=${{MySQL.MYSQLPORT}}
NODECONNECT_DB_NAME=${{MySQL.MYSQLDATABASE}}
NODECONNECT_DB_USER=${{MySQL.MYSQLUSER}}
NODECONNECT_DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
```

Use the exact service name and variable names shown by Railway if they differ. Do not set these to XAMPP/localhost values in Railway.

Configure the remaining backend variables:

```env
NODECONNECT_ALLOWED_ORIGINS=https://canopynodeconnect.com,https://www.canopynodeconnect.com,http://127.0.0.1:5174,http://localhost:5174
NODECONNECT_COOKIE_SECURE=true
TELEGRAM_BOT_TOKEN=<set as a Railway secret variable>
TELEGRAM_ADMIN_CHAT_ID=<set as a Railway variable>
NODECONNECT_GEOLOCATION_URL=https://ipwho.is
```

Keep Telegram token and database credentials as Railway service variables, never as Vercel variables and never with a `VITE_` prefix. `.dockerignore` excludes root and nested `.env` files from the image build context. Git already ignores `.env` and `.env.*` while allowing the safe `.env.example` template.

## CORS and authentication cookies

The PHP CORS helper compares the request Origin to an explicit comma-separated allowlist and returns that exact origin with `Access-Control-Allow-Credentials: true`. There is no wildcard. Both production frontend origins and existing local Vite origins remain allowed; set the production list in Railway as shown above.

Frontend auth requests already use `credentials: 'include'`. The API cookie is HttpOnly, host-only, path `/`, and `SameSite=Lax`. The frontend apex domain and API subdomain are cross-origin but same-site when both use HTTPS, so `SameSite=Lax` remains compatible and the API cookie does not need a broad `Domain` attribute. Railway terminates HTTPS before forwarding to the container, so set `NODECONNECT_COOKIE_SECURE=true`; this makes the API session cookie Secure even if PHP does not see a direct HTTPS connection. The default is inferred from PHP HTTPS state so local XAMPP behavior remains unchanged unless explicitly overridden.

## Production MySQL preparation

Create and use a new Railway MySQL database. Do not point the Railway API at local XAMPP MySQL. Before enabling authenticated pages or admin activity on production, manually initialize the new database by importing the existing `schema.sql`, then apply the existing `database/migrations/001_admin_activity.sql` once to that new Railway database and promote the intended admin account there. This is documentation only; this preparation did not run either SQL file or make database changes.

## Deployment and verification checklist

1. Create the Railway PHP service from this repository and select Dockerfile deployment.
2. Create a separate Railway MySQL service and configure the five `NODECONNECT_DB_*` variables with Railway references.
3. Set the CORS, cookie, Telegram, and geolocation variables shown above.
4. Initialize the new Railway database using the existing schema and already-approved activity migration as described above.
5. Deploy the PHP service only after its variables and database are ready.
6. Add `VITE_API_BASE_URL=https://api.canopynodeconnect.com` to Vercel's frontend environment and redeploy the frontend when ready. No frontend source change is required for these root API paths.
7. Configure DNS/custom domains for the Railway API and Vercel frontend, enable HTTPS, and verify CORS preflight, login cookie creation, `/auth/me.php`, visitor tracking, and protected admin activity reads.

No Railway deployment has been performed as part of this preparation.
