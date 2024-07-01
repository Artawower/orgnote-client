#!/bin/bash

cd ./dist/capacitor/android/bundle/release
zipalign -v 4 app-release.aab org-note-release-signed.aab
apksigner sign --ks ../../../../../org-note-release.keystore --ks-key-alias sb org-note-release-signed.aab

