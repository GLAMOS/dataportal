#!/usr/bin/env bash
set -x
set -e

# This script expects the following env vars:
# REMOTE_USER
# REMOTE_HOST
# REMOTE_IDENTITY - optional SSH key identity
# DB_HOST
# DB_PASS
# DB_NAME (is used for both login and database name)
# CI_COMMIT_REF_NAME


# Shorthand variable for remote server.
REMOTE=${REMOTE_USER}@${REMOTE_HOST}

# Paths on server
PATH_APP="app"

if [[ "$REMOTE_HOST" =~ "glamos.ch" ]] ; then
  # ETH
  PATH_WWW_ROOT="public_html"   # not trailing slash
else
  # MT
  PATH_WWW_ROOT="www"   # not trailing slash
fi

# additional connection settings
SSH_OPT=()
RSYNC_OPT=()
if [ ! -z "$REMOTE_IDENTITY" ] ; then
  deploydir=$(realpath $(dirname $0))

  # generate SSH key pair:
  #  ssh-keygen -b 4096 -f $identity -C 'comment with target usage and MA,date'
  #  then manually append the .pub key to server's .ssh/authorized_keys
  identity="${deploydir}/${REMOTE_IDENTITY}"
  chmod go-rwx "$identity"   # only executable bit can be tracked in git
  SSH_OPT+=(-i "${identity}")

  # generate known_hosts:  ssh-keyscan "$REMOTE_HOST" >> "$knownhosts"
  knownhosts="$deploydir/known_hosts"
  SSH_OPT+=(-o "CheckHostIP=no" -o "HashKnownHosts=no" -o "UserKnownHostsFile=${knownhosts}")

  # "[*]" expands to a single word - required here since all is part of the value to "-e"
  RSYNC_OPT+=(-e "ssh ${SSH_OPT[*]}")
fi

## allows to delete everything that is not in .gitignore
# src: http://unix.stackexchange.com/questions/168561/rsync-folder-while-exclude-froming-gitignore-files-at-different-depths
# src: http://stackoverflow.com/questions/13713101/rsync-exclude-according-to-gitignore-hgignore-svnignore-like-filter-c#15373763
# Note: needs to be combined with --delete-after for the receiving side being able to see the exclude rules before deleting
#  src: man rsync -> "PER-DIRECTORY RULES AND DELETE"
# note: --include needs to come before --filter
# note: does not work with (single) quotes around rule, cause of variable substitution (yields: ''' with quotes)
#  if using double-quotes here, script line needs to be:  sh -c "... $variable ..."
RSYNC_EXCLUDE_FROM_GITIGNORE=(--include='.gitignore' --filter='dir-merge,- .gitignore')


# Build assets
# note: needs to be in-sync with ENVIRONMENT for Craft (see .env), since asset filenames are different
if [ "$TIER" == "live" ]; then
  npm run build
else
  npm run build:dev
fi


# Generate DB config
bash ./deploy/generate_configs.sh


# Replace general config with config for this deployment
# spec_config="craft/config/general.$CI_COMMIT_REF_NAME.php"
# [ -f "$spec_config" ] && cp "$spec_config" "craft/config/general.php"


## Upload
rsync -i -a "${RSYNC_OPT[@]}" "${RSYNC_EXCLUDE_FROM_GITIGNORE[@]}" --delete-after ./ "${REMOTE}:${PATH_APP}"
# upload built stuff (separately since it's in .gitignore) - using non-delete of full www/
rsync -i -a "${RSYNC_OPT[@]}" www/ "${REMOTE}:${PATH_APP}/www/"
rsync -i -a "${RSYNC_OPT[@]}" .env "${REMOTE}:${PATH_APP}/"

## Hook up document root
# note: The dir in the repo is www for sure; docroot on server is another thing
ssh "${SSH_OPT[@]}" "$REMOTE" "
  if [ -e $PATH_WWW_ROOT -a ! -L $PATH_WWW_ROOT ] ; then
    mv -n $PATH_WWW_ROOT ${PATH_WWW_ROOT}.legacy ;
  fi ;
  ln -sfn ${PATH_APP}/www ${PATH_WWW_ROOT}
"

## Hookup ~/data
ssh "${SSH_OPT[@]}" "$REMOTE" "bash ${PATH_APP}/deploy/server_post_rsync.sh '${PATH_WWW_ROOT}'"

