<template>
  <div class="debug-page">
    <div class="capitalize q-pb-md q-px-sm">
      {{
        $t(
          'this information is available only on your device. It will not be sent to the server. You are free to use it for a GitHub issue.'
        )
      }}
    </div>
    <div class="system-info">
      <code-block :code="systemInfo" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { version } from '../../package.json';
import { useQuasar } from 'quasar';

import CodeBlock from 'src/components/ui/CodeBlock.vue';

const $q = useQuasar();

const prettyQuasarPlatform = [
  ...Object.keys($q.platform.is).map(
    (key: string) =>
      ` ${key}: ${$q.platform.is[key as keyof typeof $q.platform.is]}`
  ),
  ` standalone: ${!!window.navigator.standalone}`,
].join('\n');

const deviceSpecificInfo = $q.platform.is.cordova
  ? `\nDevice info:
 Model: ${device.model}
 Manufacturer: ${device.manufacturer}
 ${$q.platform.is.android ? 'SDK version: ' + device.sdkVersion : ''}
 Version: ${device.version}`
  : '';

const systemInfo = `OrgNote: ${version}
Language: ${navigator.language}

Screen:
 Screen resolution: ${screen.width}x${screen.height}
 Screen color depth: ${screen.colorDepth}
 Device pixel ratio: ${window.devicePixelRatio}

Env:
 API URL: ${process.env.API_URL}
 AUTH URL: ${process.env.AUTH_URL}
 MODE: ${process.env.NODE_ENV}

Quasar info:
${prettyQuasarPlatform}
${deviceSpecificInfo}`;
</script>

<style lang="scss" scoped>
.system-info {
  white-space: pre-line;
}
.debug-page {
  padding: var(--block-padding-md);
}
</style>
