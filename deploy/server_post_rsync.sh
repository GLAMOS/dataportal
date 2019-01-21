#!/usr/bin/env bash
set -x
set -e

######
# This script is to be run on the server via CI deployment (over SSH)
# after rsync has completed
#
# @param documentRootDir typically PATH_WWW_ROOT from CI runner script
# ######


## constants / args

# Top-level space, separate from GIT-Repo or DocRoot, as SSH upload destination
# Uploads by VAW to our server goes to ~/data; documented in:
#  https://wiki.glamos.ch/doku.php?id=website:schnittstellen
# semantic of first subdir level: where data typically comes from
DATA="$HOME/data"

if [ $# -ne 1 -o "$1" == -h -o "$1" == --help ] ; then
  echo "usage:  $0 documentRootDir" >&2
  exit -1
fi
PATH_WWW_ROOT="$1" ; shift


## helper

function make_data_dir_and_symlink {
  if [ $# -ne 2 ] ; then echo "make_data_dir_and_symlink: wrong usage" >&2 ; exit -2 ; fi
  datadir="$1" ; shift
  linkname="$1" ; shift

  # create data dir as upload destination for ETH/... (silently passes if exists)
  mkdir -p "$datadir"

  # symlink from docroot pointing to data upload dir (removed by rsync, recreated here)
  # BSD and Linux ready
  ln -snf "$datadir" "$linkname"
}


## do it for all these

# files that will be available in the Download section
# uploaded via SSH for bulk
make_data_dir_and_symlink "$DATA/from_vaw/downloads" "${PATH_WWW_ROOT}/assets/files/downloads/rsync"
# uploaded manually by CMS
make_data_dir_and_symlink "$DATA/cms_uploads/downloads" "${PATH_WWW_ROOT}/assets/files/downloads/cms"

# some other documents uploaded via CMS
make_data_dir_and_symlink "$DATA/cms_uploads/documents" "${PATH_WWW_ROOT}/assets/files/"


# from_vaw: uploaded by VAW (cronjob server-to-server)
JSON_DIR="${PATH_WWW_ROOT}/geo/"

# list of all glaciers, currently one single JSON file
make_data_dir_and_symlink "$DATA/from_vaw/inventory" "$JSON_DIR"

# glacier photos/pictures for the factsheet
make_data_dir_and_symlink "$DATA/from_vaw/glacier_infos" "$JSON_DIR"

# glacier descriptions for the factsheet
make_data_dir_and_symlink "$DATA/from_vaw/glacier_images" "$JSON_DIR"


# VAW own stuff, fully controlled by them, fully separate from homepage, just web-accessible
make_data_dir_and_symlink "$DATA/vaw" "$PATH_WWW_ROOT/"

# Remove Craft template cache
rm -r "$HOME"/app/storage/runtime/compiled_templates/*
