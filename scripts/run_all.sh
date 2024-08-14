#!/usr/bin/env bash

# MAKE SURE THIS IS RUN FROM THE ROOT OF THE REPO - with sudo
HERE="$(pwd)"
SCRIPTS="$HERE/scripts"

fd --type f -g "$SCRIPTS/*" -X chmod +x {}

$SCRIPTS/copy_files.sh
$SCRIPTS/fix_perms.sh
$SCRIPTS/format.sh
$SCRIPTS/build_summary.js
$SCRIPTS/build_tree.sh
$SCRIPTS/add_files.sh

# Pesky ds store
fd -u '^\.DS_Store$' -I -tf -X rm
