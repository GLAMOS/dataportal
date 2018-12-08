#!/bin/bash
#
# generates the DotEnv file (.env)
#
# requires following variables to be set (by ci-script and/or as CI secret vars:
# $CI_VAR_SUFFIX
# ${DB_SERVER_$CI_VAR_SUFFIX}  (e.g. $DB_SERVER_TEST or $DB_SERVER_ETHDEV)
# ...and some other with the same structure

destination=".env"


### checks
if [ -z "$CI_VAR_SUFFIX" \
  -o -z "${DB_PASSWORD_$CI_VAR_SUFFIX}" \
  ] ; then
    echo "$0: some variables are not defined or empty" >&2
    exit -2
fi


### gather variables

# some random chars
SECURITY_KEY=$(openssl rand -base64 24)


### generate
# main blocks
cat > "$destination" <<-EOF
	# File generated on CI-deploy by $0
	# ☠ WILL BE OVERWRITTEN ON DEPLOY! ☠

	# database
	DB_DRIVER="mysql"
	DB_USER="${DB_USER_$CI_VAR_SUFFIX}"
	DB_PASSWORD="${DB_PASSWORD_$CI_VAR_SUFFIX}"
	DB_SERVER="${DB_SERVER_$CI_VAR_SUFFIX}"
	DB_DATABASE="${DB_DATABASE_$CI_VAR_SUFFIX}"
	DB_SCHEMA="public"
	DB_TABLE_PREFIX="craft_"
	#DB_PORT="3306"
	#DB_CERTIFICATE="/etc/ssl/certs/ca-certificates.crt"

	# tier
	#ENVIRONMENT="development"
	#ENVIRONMENT="dev"
	#ENVIRONMENT="staging"
	ENVIRONMENT="productive"

	# Craft
	SECURITY_KEY="$SECURITY_KEY"
	SITE_URL_DE="@web"
	SITE_URL_EN="@web/en"
	SITE_URL_FR="@web/fr"
	SITE_URL_IT="@web/it"
EOF

