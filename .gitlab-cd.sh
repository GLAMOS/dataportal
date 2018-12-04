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

# Paths on server
PATH_APP="app"

PATH_WWW_ROOT="www"   # not trailing slash

## allows to delete everything that is not in .gitignore
# src: http://unix.stackexchange.com/questions/168561/rsync-folder-while-exclude-froming-gitignore-files-at-different-depths
# src: http://stackoverflow.com/questions/13713101/rsync-exclude-according-to-gitignore-hgignore-svnignore-like-filter-c#15373763
# note: does not work with (single) quotes around rule, cause of variable substitution (yields: ''' with quotes)
#  if using double-quotes here, script line needs to be:  sh -c "... $variable ..."
RSYNC_EXCLUDE_FROM_GITIGNORE="--filter=dir-merge,- /.gitignore"


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


## Upload
rsync -v -a --delete "$RSYNC_EXCLUDE_FROM_GITIGNORE" ./ "${REMOTE}:${PATH_APP}"


# Flush Craft cache
printf '%s' 'Flushing cache: '
curl --silent "https://${REMOTE_HOST}/flush"
