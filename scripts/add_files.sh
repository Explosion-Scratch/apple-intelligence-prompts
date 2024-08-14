#!/usr/bin/env bash

# Run from the root of the repo
fd --type f -g "*.json" . -X git add -v {}
fd --type f -g "*.cryptex_info" . -X git add -v {}
fd --type f -g "*Manifest.plist" . -X git add -v {}
fd --type f -g "*Restore.plist" . -X git add -v {}
fd --type f -g "*Info.plist" . -X git add -v {}
fd --type f -g "*GenerativeModels.xml" . -X git add -v {}
fd --type f -g "*Configuration.xml" . -X git add -v {}
fd --type f -g "*Version.plist" . -X git add -v {}
fd --type f -g "*.pbtxt" . -X git add -v {}
fd --type f -g "receipt.plist" . -X git add -v {}
git add -v scripts
git add "*.md"
git add summary.json
git add FILES.txt
