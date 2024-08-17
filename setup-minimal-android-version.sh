#!/bin/bash

sed -i '' -e 's/minSdkVersion = .*/minSdkVersion = 32/g' src-capacitor/android/variables.gradle
