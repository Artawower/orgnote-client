#!/bin/bash

if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' -e 's/minSdkVersion = .*/minSdkVersion = 32/g' src-capacitor/android/variables.gradle
else
    sed -i -e 's/minSdkVersion = .*/minSdkVersion = 32/g' src-capacitor/android/variables.gradle
fi
