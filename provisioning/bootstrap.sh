#!/usr/bin/env bash
set -x
set -e

## VARIABLES

PROJECT_NAME=$(hostname -s)
NODE_VERSION='8.x'
SYSTEM_USER='vagrant'

PATH_HOME="/home/${SYSTEM_USER}"
PATH_VAGRANT='/vagrant'
PATH_PROVISIONING="${PATH_VAGRANT}/provisioning"

DB_DUMP=$( (cd "${PATH_PROVISIONING}" && find . \! -name . -prune -name '*.sql') | sort -nr | head -1)
DB_LOCAL_ROOTPASSWORD=${PROJECT_NAME}
DB_LOCAL_DATABASE=${PROJECT_NAME}
DB_LOCAL_USERNAME=${PROJECT_NAME}
DB_LOCAL_PASSWORD=${PROJECT_NAME}

CERT_FILENAME='mt.local.RootCA.crt'

## PACKAGES

debconf-set-selections <<< "maria-db-server mysql-server/root_password_again password ${DB_LOCAL_ROOTPASSWORD}"
debconf-set-selections <<< "maria-db-server mysql-server/root_password password ${DB_LOCAL_ROOTPASSWORD}"

# https://nodejs.org/en/download/package-manager/
curl -sL "https://deb.nodesource.com/setup_${NODE_VERSION}" | sudo -E bash -

## Craft Requirements
## https://craftcms.com/docs/requirements

## Update is already done by the Node setup package.
#apt-get update
apt-get upgrade -y
apt-get install -y \
  git-core \
  build-essential \
  openssl \
  libssl-dev \
  nodejs \
  mariadb-server \
  apache2 \
  php7.1 \
  php7.1-mysql \
  php7.1-gd \
  php-horde-crypt-blowfish \
  php7.1-mcrypt \
  php7.1-json \
  php7.1-curl \
  php7.1-zip

## DATABASE

## Ensure the database server is running.
systemctl start mariadb

## Set up the database.
mysql --user=root --password="${DB_LOCAL_ROOTPASSWORD}" <<SQL
  CREATE DATABASE IF NOT EXISTS \`${DB_LOCAL_DATABASE}\` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
  DROP USER IF EXISTS '${DB_LOCAL_USERNAME}'@'%';
  CREATE USER '${DB_LOCAL_USERNAME}'@'%' IDENTIFIED BY '${DB_LOCAL_PASSWORD}';
  GRANT ALL PRIVILEGES ON *.* TO '${DB_LOCAL_USERNAME}'@'%';
  FLUSH PRIVILEGES
SQL

## Import the dump.
mysql --user=root --password="${DB_LOCAL_ROOTPASSWORD}" "${DB_LOCAL_DATABASE}" < "${PATH_PROVISIONING}/${DB_DUMP}"

## WEB SERVER

## Ensure the Apache log directory exists and is empty.
mkdir -p ${PATH_VAGRANT}/log
rm -rf ${PATH_VAGRANT}/log/*

sed -e "s~PATH_PROJECT~${PATH_VAGRANT}~gi" ${PATH_PROVISIONING}/apache2.conf > "/etc/apache2/sites-available/${PROJECT_NAME}.conf"

a2dissite 000-default
a2ensite "${PROJECT_NAME}"
a2enmod rewrite
a2enmod headers
phpenmod mcrypt
service apache2 restart

## MISCELLANEOUS

cp ${PATH_PROVISIONING}/${CERT_FILENAME} /usr/local/share/ca-certificates
update-ca-certificates

sed -e "s~PATH_PROJECT~${PATH_VAGRANT}~gi" ${PATH_PROVISIONING}/bash_profile > ${PATH_HOME}/.bash_profile
