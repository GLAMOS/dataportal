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
PATH_WWW_ROOT="www/"
PATH_WWW_ASSETS="www/assets/"
PATH_WWW_IMG="www/assets/images"
PATH_WWW_CSS="www/theme/css/"
PATH_WWW_FONTS="www/theme/webfonts/"
PATH_WWW_JS="www/theme/js/"
PATH_CRAFT="/"


# Build assets
if [ "$CI_COMMIT_REF_NAME" == "TEST" ]
then npm run build:dev
else npm run build
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

# Create the necessary directory structure.
ssh ${REMOTE} "mkdir -p \
    ${PATH_CRAFT} ${PATH_WWW_ROOT} ${PATH_WWW_ASSETS} \
    ${PATH_WWW_IMG} ${PATH_WWW_CSS} ${PATH_WWW_FONTS} ${PATH_WWW_JS}"

# Sync frontend assets.
rsync -a --exclude="*/" --delete ${PATH_WWW_ROOT} ${REMOTE}:${PATH_WWW_ROOT}
rsync -a --exclude="*/" --delete ${PATH_WWW_ASSETS} ${REMOTE}:${PATH_WWW_ASSETS}
rsync -a --delete ${PATH_WWW_CSS} ${REMOTE}:${PATH_WWW_CSS}
rsync -a --delete ${PATH_WWW_FONTS} ${REMOTE}:${PATH_WWW_FONTS}
rsync -a --delete ${PATH_WWW_IMG} ${REMOTE}:${PATH_WWW_IMG}
rsync -a --delete ${PATH_WWW_JS} ${REMOTE}:${PATH_WWW_JS}
rsync -a --delete ${PATH_CRAFT} ${REMOTE}:${PATH_CRAFT}

ssh ${REMOTE} "mkdir -p ${PATH_CRAFT}storage"

# Flush Craft cache
echo -n "Flushing cache: "
curl --silent https://${REMOTE_HOST}/flush

# Generate remote crontab
ssh ${REMOTE} "crontab -" <<EOF
# ☠ WILL BE OVERWRITTEN ON DEPLOY! ☠
# Edit the contents of this file in $0
MAILTO=stephan.balmer@meteotest.ch

# Periodically refresh station status
*/5 * * * * /usr/local/bin/curl --silent --insecure --fail https://$REMOTE_HOST/pull/rma?plain > log/update.log 2>&1
EOF
