#!/bin/bash

# Read package json version via jq
VERSION=$(jq -r '.version' package.json)

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' -e "s/version: '.*'/version: '$VERSION'/g" ./quasar.config.ts  
  sed -i '' -e 's/versionName ".*/versionName "'$VERSION'"/g' ./src-capacitor/android/app/build.gradle
else
  sed -i -e "s/version: '.*'/version: '$VERSION'/g" ./quasar.config.ts  
  sed -i -e 's/versionName ".*/versionName "'$VERSION'"/g' ./src-capacitor/android/app/build.gradle
fi
