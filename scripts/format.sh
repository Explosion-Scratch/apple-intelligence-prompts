#!/usr/bin/env bash

jqb () {
  temp=$(mktemp)
  printf 'input = %s\n' "$1"
  printf 'temp  = %s\n' "$temp"
  cp -- "$1" "$temp"
  jq . "$temp" > "$1"
  rm "$temp"
}

find . -type f -name "*.json" -print0 | \
	while IFS= read -r -d '' file; do
		jqb "$file"
	done
