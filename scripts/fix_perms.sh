#!/usr/bin/env bash
resetperms () {
	sudo chown $USER "$@"
	sudo chmod a+rwx "$@"
}


find . -type f | \
        while IFS= read -r -d '' file; do
                resetperms "$file"
        done
