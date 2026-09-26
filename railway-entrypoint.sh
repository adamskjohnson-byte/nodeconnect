#!/bin/sh
set -eu

echo "---- DEBUG: mods-enabled MPM symlinks ----"
ls -la /etc/apache2/mods-enabled/ | grep -i mpm || echo "none found"
echo "---- DEBUG: apache2ctl -M (loaded modules) ----"
apache2ctl -M 2>&1 | grep -i mpm || echo "apache2ctl failed or no mpm shown"
echo "---- END DEBUG ----"

port="${PORT:-8080}"
case "$port" in
    ''|*[!0-9]*)
        echo "PORT must be a numeric TCP port." >&2
        exit 1
        ;;
esac

sed -i -E "s/^Listen [0-9]+$/Listen ${port}/" /etc/apache2/ports.conf
sed -i -E "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:${port}>/" /etc/apache2/sites-available/000-default.conf

exec apache2-foreground

port="${PORT:-8080}"
case "$port" in
    ''|*[!0-9]*)
        echo "PORT must be a numeric TCP port." >&2
        exit 1
        ;;
esac

sed -i -E "s/^Listen [0-9]+$/Listen ${port}/" /etc/apache2/ports.conf
sed -i -E "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:${port}>/" /etc/apache2/sites-available/000-default.conf

exec apache2-foreground
