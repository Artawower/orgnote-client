#!/bin/bash

yarn build:all
mkdir ./dist/build

# password=$(uuidgen)
# echo y | keytool -genkeypair \
#                  -dname "cn=Artur Iaroshenko, c=GE" \
#                  -alias sb \
#                  -keypass $password \
#                  -keystore ./sb-release.keystore \
#                  -storepass $password \
#                  -keyalg RSA \
#                  -keysize 4096 \
#                  -validity 20000

version=awk -F'"' '/"version": ".+"/{ print $4; exit; }' ./package.json

echo $KEYPASS
echo $STOREPASS

java -jar bundletool.jar build-apks \
     --mode=universal \
     --bundle=./dist/cordova/android/bundle/release/app-release.aab \
     --output=./dist/pwa/builds/second-brain.apks \
     --ks=./sb-release.keystore \
     --ks-pass=pass:$KEYPASS \
     --ks-key-alias=sb \
     --key-pass=pass:$STOREPASS

unzip -p ./dist/pwa/builds/second-brain.apks universal.apk > ./dist/pwa/builds/second-brain-$version.apk
