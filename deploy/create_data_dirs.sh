#!/bin/bash

# scoping
cd ~/


# top-level space, separate from GIT-Repo or DocRoot
mkdir -p data


# where data typically comes from
mkdir -p data/from_vaw
mkdir -p data/cms_uploads


# list of all glaciers, currently for single JSON file
mkdir -p data/from_vaw/inventory

# glacier photos/pictures for the factsheet
mkdir -p data/from_vaw/glacier_images

# glacier descriptions for the factsheet
mkdir -p data/from_vaw/glacier_infos

# files that will be available in the Download section
mkdir -p data/cms_uploads/downloads


# varia fully managed by VAW, indipendent of Website, shall be web-available
mkdir -p data/vaw

