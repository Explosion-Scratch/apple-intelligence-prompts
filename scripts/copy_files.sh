#!/usr/bin/env bash
# These files only exist on macOS 15.1 Sequoia beta
sudo rm -rf ./com_apple_MobileAsset_UAF_FM_GenerativeModels
sudo rm -rf ./com_apple_MobileAsset_UAF_SummarizationKitConfiguration
sudo cp -r /System/Library/AssetsV2/com_apple_MobileAsset_UAF_FM_GenerativeModels .
sudo cp -r /System/Library/AssetsV2/com_apple_MobileAsset_UAF_SummarizationKitConfiguration .
