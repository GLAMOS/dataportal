#!/bin/bash
set -x
set -e

sparse_option='core.sparsecheckout'
sparse_config='.git/info/sparse-checkout'

enable_sparse_checkout ()
{
  git config "$sparse_option" true
}

edit_sparse_config ()
{
  if [ ! -f "$sparse_config" ]; then
    echo "\
## git config $sparse_option true
## Paths to include in the sparse checkout, or to exclude (precede with '!').
## Lines that start with '#' are comments.

/composer/
/symfony/
/utils/
" > "$sparse_config"
  fi
}

DB_DUMP=$(date '+%F').sql
DB_REMOTE_HOST=calvin.meteotest.ch
DB_REMOTE_PORT=3306
DB_REMOTE_USERNAME=bewaesserungsnetz
DB_REMOTE_DATABASE=bewaesserungsnetz
SSH_REMOTE_HOST=bewaesserungsnetz.meteotest.ch
SSH_REMOTE_USER=bewaesserungsnetz
PATH_PROVISIONING=$(realpath "$(dirname "$0")")
PATH_PROJECT=$(dirname "${PATH_PROVISIONING}")
PATH_INCLUDES="${PATH_PROVISIONING}/includes"
CERT_URI="https://meteotest.ch/x/mt.local.crt"
CERT_FILENAME=mt.local.RootCA.crt

cd "${PATH_PROVISIONING}"
## http://dev.mysql.com/doc/refman/5.7/en/mysqldump.html
mysqldump --host="${DB_REMOTE_HOST}" --port="${DB_REMOTE_PORT}" \
  --user="${DB_REMOTE_USERNAME}" --password --no-create-db --verbose \
  "${DB_REMOTE_DATABASE}" > "${DB_DUMP}"

# Fetch Meteotest includes as the provisioning script doesn't have access.
if [ -d "$PATH_INCLUDES" ]; then
  (
    cd "$PATH_INCLUDES"
    git pull
  )
else
  (
    local_repo_dir=$PATH_INCLUDES
    origin_name='origin'
    origin_uri='git@gitlab.mt.local:web_software/meteotest_includes.git'
    branch='master'
    
    git init "$local_repo_dir" &&
      cd "$local_repo_dir" &&
      git remote add "$origin_name" "$origin_uri" &&
      git remote -v &&
      enable_sparse_checkout &&
      git fetch "$origin_name" &&
      edit_sparse_config &&
      git pull origin "$branch" &&
      git branch --set-upstream-to="origin/$branch" "$branch"
  )
fi

## Fetch Meteotest certificate and save to the provisioning folder.
wget -O "${CERT_FILENAME}" "${CERT_URI}"

cd "${PATH_PROJECT}"
mkdir -p craft/storage
chmod -R 777 craft/storage
rm -rf craft/storage/runtime

#rsync -r ${SSH_REMOTE_USER}@${SSH_REMOTE_HOST}:~/www/assets ./www
rsync -aP "${SSH_REMOTE_USER}@${SSH_REMOTE_HOST}:~/www/imager" ./www
rsync -aP "${SSH_REMOTE_USER}@${SSH_REMOTE_HOST}:~/craft/storage" ./craft

rm -rf node_modules
npm install
