#!/bin/bash

# Find Android SDK build-tools
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    echo "Error: ANDROID_HOME or ANDROID_SDK_ROOT not set"
    exit 1
fi

SDK_ROOT="${ANDROID_HOME:-$ANDROID_SDK_ROOT}"
BUILD_TOOLS_DIR="$SDK_ROOT/build-tools"

# Find latest build-tools version
LATEST_BUILD_TOOLS=$(ls -1 "$BUILD_TOOLS_DIR" 2>/dev/null | sort -V | tail -1)
if [ -z "$LATEST_BUILD_TOOLS" ]; then
    echo "Error: No build-tools found in $BUILD_TOOLS_DIR"
    exit 1
fi

ZIPALIGN="$BUILD_TOOLS_DIR/$LATEST_BUILD_TOOLS/zipalign"
APKSIGNER="$BUILD_TOOLS_DIR/$LATEST_BUILD_TOOLS/apksigner"

cd ./dist/capacitor/android/bundle/release
"$ZIPALIGN" -v 4 app-release.aab org-note-release-signed.aab
"$APKSIGNER" sign --min-sdk-version 32 --ks ../../../../../deploy/org-note-release.keystore --ks-key-alias sb org-note-release-signed.aab

