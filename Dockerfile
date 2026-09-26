FROM php:8.3-apache-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libcurl4-openssl-dev \
    && docker-php-ext-install curl pdo_mysql \
    && rm -rf /var/lib/apt/lists/* \
    && php -r 'foreach (["PDO", "pdo_mysql", "curl", "openssl"] as $extension) { if (!extension_loaded($extension)) { fwrite(STDERR, "Missing PHP extension: {$extension}\\n"); exit(1); } }'

# Fix: ensure only one MPM (prefork) is enabled
RUN a2dismod mpm_event mpm_worker 2>/dev/null || true \
    && a2enmod mpm_prefork

RUN sed -ri 's!/var/www/html!/var/www/html/api!g' /etc/apache2/sites-available/*.conf

COPY api/ /var/www/html/api/
COPY railway-entrypoint.sh /usr/local/bin/railway-entrypoint
RUN chmod 0755 /usr/local/bin/railway-entrypoint

ENTRYPOINT ["/usr/local/bin/railway-entrypoint"]