#!/bin/bash

yarn build:all
mkdir -p ./dist/build

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

version=$(awk -F '"' '/"version": ".+"/{ print $4; exit; }' ./package.json)

echo $KEYPASS
echo $STOREPASS

java -jar bundletool.jar build-apks \
     --mode=universal \
     --bundle=./dist/cordova/android/bundle/release/app-release.aab \
     --output=./dist/pwa/builds/orgnote.apks \
     --ks=./sb-release.keystore \
     --ks-pass=pass:$STOREPASS \
     --ks-key-alias=sb

unzip -p ./dist/pwa/builds/orgnote.apks universal.apk > ./dist/pwa/builds/orgnote-$version.apk
