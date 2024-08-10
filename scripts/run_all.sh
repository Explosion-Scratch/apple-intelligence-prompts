#!/usr/bin/env bash

# MAKE SURE THIS IS RUN FROM THE ROOT OF THE REPO - with sudo
HERE="$(pwd)"
SCRIPTS="$HERE/scripts"

$SCRIPTS/copy_files.sh
$SCRIPTS/fix_perms.sh
$SCRIPTS/format.sh
$SCRIPTS/build_summary.js

# Pesky ds store
fd -u '^\.DS_Store$' -I -tf -X rm