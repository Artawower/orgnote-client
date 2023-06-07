#!/bin/bash

yarn build:all
java -jar bundletool.jar build-apks --bundle=./dist/cordova/android/bundle/release/app-release.aab --output=./dist/second-brain.apks
