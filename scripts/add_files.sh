#!/usr/bin/env bash

# Run from the root of the repo
fd --type f -H -g "*.json" . -X git add -v {}
fd --type f -H -g "*.cryptex_info" . -X git add -v {}
fd --type f -H -g "*Manifest.plist" . -X git add -v {}
fd --type f -H -g "*Restore.plist" . -X git add -v {}
fd --type f -H -g "*Info.plist" . -X git add -v {}
fd --type f -H -g "*GenerativeModels.xml" . -X git add -v {}
fd --type f -H -g "*Configuration.xml" . -X git add -v {}
fd --type f -H -g "*Version.plist" . -X git add -v {}
fd --type f -H -g "*.pbtxt" . -X git add -v {}
fd --type f -H -g "receipt.plist" . -X git add -v {}
git add -v scripts
git add "*.md"
git add summary.json
git add FILES.txt
