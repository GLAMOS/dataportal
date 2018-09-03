#!/bin/bash
set -x
set -e

DB_DUMP=$(date '+%F').sql
DB_REMOTE_HOST=calvin.meteotest.ch
DB_REMOTE_PORT=3306
DB_REMOTE_USERNAME=glamos
DB_REMOTE_DATABASE=glamos
SSH_REMOTE_HOST=glamos.meteotest.ch
SSH_REMOTE_USER=glamos
PATH_PROVISIONING=$(realpath "$(dirname "$0")")
PATH_PROJECT=$(dirname "${PATH_PROVISIONING}")
CERT_URI="https://meteotest.ch/x/mt.local.crt"
CERT_FILENAME=mt.local.RootCA.crt

cd "${PATH_PROVISIONING}"
## http://dev.mysql.com/doc/refman/5.7/en/mysqldump.html
mysqldump --host="${DB_REMOTE_HOST}" --port="${DB_REMOTE_PORT}" \
  --user="${DB_REMOTE_USERNAME}" --password --no-create-db --ssl --verbose \
  "${DB_REMOTE_DATABASE}" > "${DB_DUMP}"

## Fetch Meteotest certificate and save to the provisioning folder.
wget -O "${CERT_FILENAME}" "${CERT_URI}"

cd "${PATH_PROJECT}"

rsync -aPz "${SSH_REMOTE_USER}@${SSH_REMOTE_HOST}:~/www/assets" './www/'
rsync -aPz "${SSH_REMOTE_USER}@${SSH_REMOTE_HOST}:~/storage" . || (
  mkdir -p storage
  chmod -R 777 storage
)

rm -rf storage/runtime
rm -rf node_modules

npm install
