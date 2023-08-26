#!/bin/bash

yarn build:all
mkdir ./dist/build
java -jar bundletool.jar build-apks --mode=universal --bundle=./dist/cordova/android/bundle/release/app-release.aab --output=./dist/pwa/builds/second-brain.apks
unzip -p ./dist/pwa/builds/second-brain.apks universal.apk > ./dist/pwa/builds/second-brain.apk
