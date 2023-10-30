<template>
  <div class="debug-page">
    <div class="capitalize text-h5 q-pb-md">
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

const prettyQuasarPlatform = Object.keys($q.platform.is)
  .map((key: string) => ` ${key}: ${($q.platform.is as any)[key]}`)
  .join('\n');

const systemInfo = `OrgNote: ${version}
Language: ${navigator.language}

Screen:
 Screen resolution: ${screen.width}x${screen.height}
 Screen color depth: ${screen.colorDepth}
 Device pixel ratio: ${window.devicePixelRatio}

Quasar info:
${prettyQuasarPlatform}`;
</script>

<style lang="scss" scoped>
.system-info {
  white-space: pre-line;
}
.debug-page {
  padding: var(--default-block-padding);
}
</style>