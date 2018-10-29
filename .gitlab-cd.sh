#!/usr/bin/env bash
set -x
set -e

# This script expects the following env vars:
# REMOTE_USER
# REMOTE_HOST
# DB_HOST
# DB_PASS
# DB_NAME (is used for both login and database name)
# CI_COMMIT_REF_NAME

# Shorthand variable for remote server.
REMOTE=${REMOTE_USER}@${REMOTE_HOST}

# Meteotest frontent asset paths to sync.
PATH_WWW_ROOT="www"
PATH_WWW_THEME="${PATH_WWW_ROOT}/theme"
PATH_WWW_GEO="${PATH_WWW_ROOT}/geo"

# Build assets
if [ "$CI_COMMIT_REF_NAME" == "TEST" ]; then
  npm run build:dev
else
  npm run build
fi

# Generate DB config
# cat > craft/config/db.php <<EOF
# <?php
# ☠ WILL BE OVERWRITTEN ON DEPLOY! ☠
# Edit the contents of this file in $0
# return array(
#     'tablePrefix' => 'craft',
#     'attributes' => array( PDO::MYSQL_ATTR_SSL_CA => '/etc/ssl/certs/ca-certificates.crt', ),
#     'server' => 'mariadb2',
#     'database' => '$DB_NAME',
#     'user'     => '$DB_NAME',
#     'password' => '$DB_PASS'
# );
# EOF

# Replace general config with config for this deployment
# spec_config="craft/config/general.$CI_COMMIT_REF_NAME.php"
# [ -f "$spec_config" ] && cp "$spec_config" "craft/config/general.php"

rsync -vv -a --exclude='*/' --delete "${PATH_WWW_ROOT}" "${REMOTE}:${PATH_WWW_ROOT}"
rsync -vv -a --delete "${PATH_WWW_THEME}" "${REMOTE}:${PATH_WWW_ROOT}"
rsync -vv -a --delete "${PATH_WWW_GEO}" "${REMOTE}:${PATH_WWW_ROOT}"
rsync -vv -a --delete 'config' 'templates' 'vendor' \
  "${REMOTE}:"

ssh -vv "${REMOTE}" 'mkdir -p storage'

# Flush Craft cache
printf '%s' 'Flushing cache: '
curl --silent "https://${REMOTE_HOST}/flush"
