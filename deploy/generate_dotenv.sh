#!/bin/bash
#
# generates the DotEnv file (.env)
#
# requires following variables to be set (by ci-script and/or as CI secret vars:
# $CI_VAR_SUFFIX
# ${DB_SERVER_$CI_VAR_SUFFIX}  (e.g. $DB_SERVER_TEST or $DB_SERVER_ETHDEV)
# ...and some other with the same structure

destination=".env"


### helper for accessing CI secret variables
# @param variable name, which is also main part of env var
# @uses $CI_VAR_SUFFIX
function from_env {
  name=$1 ; shift
  varname="${name}_${CI_VAR_SUFFIX}"
  # indirection / variable variable
  echo "${!varname}"
}


### checks
if [ -z "$CI_VAR_SUFFIX" \
  -o -z "$(from_env DB_PASSWORD)" \
  ] ; then
    echo "$0: some variables are not defined or empty" >&2
    exit -2
fi


### gather variables
additions=('')

# mapping MT tier definitions to Craft ENVIRONMENT (usualy one of: 'dev', 'staging', 'production', etc.)
declare -A tier2env=([dev]=dev [int]=dev [test]=staging [live]=production)
ENVIRONMENT="${tier2env[$TIER]}"

# some random chars
SECURITY_KEY=$(openssl rand -base64 24)

if [[ "$REMOTE_HOST" =~ "glamos.ch" ]] ; then
  ## We're behind a kind of reverse proxy...
  # https://github.com/omeka/Omeka/issues/685
  # https://github.com/fisharebest/webtrees/issues/328
  # https://issues.apache.org/jira/browse/KNOX-924
  ## trials to force HTTPS
  # HTTP_SCHEME="https"
  # REQUEST_SCHEME="https"
  # SERVER_PORT=443
  # HTTP_UPGRADE_INSECURE_REQUESTS="1"
  # HTTP_X_FORWARDED_PROTO="https"
  # HTTP_X_FORWARDED_PORT=443
  # CRAFT_SITE_URL="https://{host}/"
  # SITE_URL="https://{host}/"
  # SITE_URL_DE="https://@web"
  ## the one and only that works
  additions+=('# ETH is behind a reverse proxy, so server just sees port 80' 'HTTPS="on"')
fi


### generate
# main blocks
cat > "$destination" <<-EOF
	# File generated on CI-deploy by $0
	# ☠ WILL BE OVERWRITTEN ON DEPLOY! ☠

	# database
	DB_DRIVER="mysql"
	DB_USER="$(from_env DB_USER)"
	DB_PASSWORD="$(from_env DB_PASSWORD)"
	DB_SERVER="$(from_env DB_SERVER)"
	DB_DATABASE="$(from_env DB_DATABASE)"
	DB_SCHEMA="public"
	DB_TABLE_PREFIX="craft_"
	#DB_PORT="3306"
	#DB_CERTIFICATE="/etc/ssl/certs/ca-certificates.crt"

	# Craft
	ENVIRONMENT="$ENVIRONMENT"
	SECURITY_KEY="$SECURITY_KEY"
	SITE_URL_DE="@web"
	SITE_URL_EN="@web/en"
	SITE_URL_FR="@web/fr"
	SITE_URL_IT="@web/it"
EOF

# output additional env variables
for addition in "${additions[@]}" ; do
  echo "$addition" >> $destination
done

