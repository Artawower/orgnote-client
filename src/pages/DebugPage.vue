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

import CodeBlock from 'src/components/ui/CodeBlock.vue';

let platform =
  navigator?.userAgentData?.platform || navigator?.platform || 'unknown';

const systemInfo = `OrgNote: ${version}
Browser version: ${navigator.userAgent}
OS: ${platform}
Language: ${navigator.language}
Screen resolution: ${screen.width}x${screen.height}
Screen color depth: ${screen.colorDepth}
Device pixel ratio: ${window.devicePixelRatio}`;
</script>

<style lang="scss" scoped>
.system-info {
  white-space: pre-line;
}
.debug-page {
  padding: var(--default-block-padding);
}
</style>
