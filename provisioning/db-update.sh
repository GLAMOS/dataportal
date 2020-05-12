#!/usr/bin/env bash
set -x
set -e

## VARIABLES

PROJECT_NAME=$(hostname -s)

PATH_VAGRANT='/vagrant'
PATH_PROVISIONING="${PATH_VAGRANT}/provisioning"

DB_REMOTE_HOST=calvin.meteotest.ch
DB_REMOTE_PORT=3306
DB_REMOTE_USERNAME=glamos
DB_REMOTE_DATABASE=glamos

DB_DUMP=$(date '+%F').sql
DB_LOCAL_ROOTPASSWORD=${PROJECT_NAME}
DB_LOCAL_DATABASE=${PROJECT_NAME}
DB_LOCAL_USERNAME=${PROJECT_NAME}
DB_LOCAL_PASSWORD=${PROJECT_NAME}

cd "${PATH_PROVISIONING}"
## http://dev.mysql.com/doc/refman/5.7/en/mysqldump.html
mysqldump --host="${DB_REMOTE_HOST}" --port="${DB_REMOTE_PORT}" \
  --user="${DB_REMOTE_USERNAME}" --password --no-create-db --ssl --verbose \
  "${DB_REMOTE_DATABASE}" > "${DB_DUMP}"

## Set up the database.
mysql --user=root --password="${DB_LOCAL_ROOTPASSWORD}" <<SQL
  DROP DATABASE IF EXISTS \`${DB_LOCAL_DATABASE}\`;
  CREATE DATABASE IF NOT EXISTS \`${DB_LOCAL_DATABASE}\` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
  DROP USER IF EXISTS '${DB_LOCAL_USERNAME}'@'%';
  CREATE USER '${DB_LOCAL_USERNAME}'@'%' IDENTIFIED BY '${DB_LOCAL_PASSWORD}';
  GRANT ALL PRIVILEGES ON *.* TO '${DB_LOCAL_USERNAME}'@'%';
  FLUSH PRIVILEGES
SQL

## Import the dump
mysql --user=root --password="${DB_LOCAL_ROOTPASSWORD}" "${DB_LOCAL_DATABASE}" < "${DB_DUMP}"

