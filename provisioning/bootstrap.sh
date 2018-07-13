#!/usr/bin/env bash
set -x
set -e

# __     __         _       _     _
# \ \   / /_ _ _ __(_) __ _| |__ | | ___  ___
#  \ \ / / _` | '__| |/ _` | '_ \| |/ _ \/ __|
#   \ V / (_| | |  | | (_| | |_) | |  __/\__ \
#    \_/ \__,_|_|  |_|\__,_|_.__/|_|\___||___/
#

PROJECT_NAME=$(hostname -s)
NODE_VERSION='6.x'
SYSTEM_USER='vagrant'

PATH_HOME="/home/${SYSTEM_USER}"
PATH_VAGRANT='/vagrant'
PATH_PROVISIONING="${PATH_VAGRANT}/provisioning"
PATH_PHP_INCLUDES='/usr/share/php/'

DB_DUMP=$( (cd "${PATH_PROVISIONING}" && find . \! -name . -prune -name '*.sql') | sort -nr | head -1)
DB_LOCAL_ROOTPASSWORD=${PROJECT_NAME}
DB_LOCAL_DATABASE=${PROJECT_NAME}
DB_LOCAL_USERNAME=${PROJECT_NAME}
DB_LOCAL_PASSWORD=${PROJECT_NAME}

CERT_FILENAME='mt.local.RootCA.crt'

#  ____            _
# |  _ \ __ _  ___| | ____ _  __ _  ___  ___
# | |_) / _` |/ __| |/ / _` |/ _` |/ _ \/ __|
# |  __/ (_| | (__|   < (_| | (_| |  __/\__ \
# |_|   \__,_|\___|_|\_\__,_|\__, |\___||___/
#                            |___/
#

debconf-set-selections <<< "maria-db-server mysql-server/root_password_again password ${DB_LOCAL_ROOTPASSWORD}"
debconf-set-selections <<< "maria-db-server mysql-server/root_password password ${DB_LOCAL_ROOTPASSWORD}"

# https://nodejs.org/en/download/package-manager/
curl -sL "https://deb.nodesource.com/setup_${NODE_VERSION}" | sudo -E bash -

# Craft Requirements
# https://craftcms.com/docs/requirements

# Update is already done by the Node setup package.
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
  php7.1-curl

  # Install Gulp globally for easier execution.
npm install -g \
  gulp

#  ____  _   _ ____
# |  _ \| | | |  _ \
# | |_) | |_| | |_) |
# |  __/|  _  |  __/
# |_|   |_| |_|_|
#

# Enable PHP's short open tag.
find / -path '*/apache*/php.ini' -exec sed -i -e "s/\(short_open_tag\) = Off/\1 = On/gi" '{}' +

# Move Meteotest includes to the right place.
mkdir -p ${PATH_PHP_INCLUDES}
cp -r ${PATH_PROVISIONING}/includes/{composer,symfony,utils} ${PATH_PHP_INCLUDES}

#  ____        _        _
# |  _ \  __ _| |_ __ _| |__   __ _ ___  ___
# | | | |/ _` | __/ _` | '_ \ / _` / __|/ _ \
# | |_| | (_| | || (_| | |_) | (_| \__ \  __/
# |____/ \__,_|\__\__,_|_.__/ \__,_|___/\___|
#

# Ensure the database server is running.
systemctl start mariadb

# Set up the database.
mysql --user=root --password="${DB_LOCAL_ROOTPASSWORD}" -e "
  CREATE DATABASE IF NOT EXISTS \`${DB_LOCAL_DATABASE}\` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
  DROP USER IF EXISTS '${DB_LOCAL_USERNAME}'@'%';
  CREATE USER '${DB_LOCAL_USERNAME}'@'%' IDENTIFIED BY '${DB_LOCAL_PASSWORD}';
  GRANT ALL PRIVILEGES ON *.* TO '${DB_LOCAL_USERNAME}'@'%';
  FLUSH PRIVILEGES
"

# Import the dump.
mysql --user=root --password="${DB_LOCAL_ROOTPASSWORD}" "${DB_LOCAL_DATABASE}" < "${PATH_PROVISIONING}/${DB_DUMP}"

# __        __   _       ____
# \ \      / /__| |__   / ___|  ___ _ ____   _____ _ __
#  \ \ /\ / / _ \ '_ \  \___ \ / _ \ '__\ \ / / _ \ '__|
#   \ V  V /  __/ |_) |  ___) |  __/ |   \ V /  __/ |
#    \_/\_/ \___|_.__/  |____/ \___|_|    \_/ \___|_|
#

# Ensure the Apache log directory exists and is empty.
mkdir -p ${PATH_VAGRANT}/log
rm -rf ${PATH_VAGRANT}/log/*

sed -e "s~PATH_PROJECT~${PATH_VAGRANT}~gi" ${PATH_PROVISIONING}/apache2.conf > "/etc/apache2/sites-available/${PROJECT_NAME}.conf"

a2dissite 000-default
a2ensite "${PROJECT_NAME}"
a2enmod rewrite
a2enmod headers
phpenmod mcrypt
service apache2 restart

#  __  __ _              _ _
# |  \/  (_)___  ___ ___| | | __ _ _ __   ___  ___  _   _ ___
# | |\/| | / __|/ __/ _ \ | |/ _` | '_ \ / _ \/ _ \| | | / __|
# | |  | | \__ \ (_|  __/ | | (_| | | | |  __/ (_) | |_| \__ \
# |_|  |_|_|___/\___\___|_|_|\__,_|_| |_|\___|\___/ \__,_|___/
#

cp ${PATH_PROVISIONING}/${CERT_FILENAME} /usr/local/share/ca-certificates
update-ca-certificates

sed -e "s~PATH_PROJECT~${PATH_VAGRANT}~gi" ${PATH_PROVISIONING}/bash_profile > ${PATH_HOME}/.bash_profile
