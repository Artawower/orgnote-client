#!/bin/bash

# Build ssr and pwa.
bun run build:ssr

# This build are unused cause releases are done by github actions
# mkdir -p ./dist/build

# version=$(awk -F '"' '/"version": ".+"/{ print $4; exit; }' ./package.json)

# java -jar bundletool.jar build-apks \
#      --mode=universal \
#      --bundle=./dist/cordova/android/bundle/release/app-release.aab \
#      --output=./dist/pwa/builds/orgnote.apks \
#      --ks=./org-note-release.keystore \
#      --ks-pass=pass:$STOREPASS \
#      --ks-key-alias=sb

# unzip -p ./dist/pwa/builds/orgnote.apks universal.apk > ./dist/pwa/builds/orgnote-$version.apk
# echo "OrgNote APK built at ./dist/pwa/builds/orgnote-$version.apk"
