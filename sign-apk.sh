#!/bin/bash

cd ./dist/capacitor/android/apk/release
zipalign -v 4 app-release-unsigned.apk org-note-release-signed.apk
apksigner sign --ks ../../../../../org-note-release.keystore --ks-key-alias sb org-note-release-signed.apk

