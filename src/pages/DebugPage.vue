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
      <code-block v-if="systemInfo" :code="systemInfo" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ModelsPublicNoteEncryptionTypeEnum } from 'orgnote-api/remote-api';
import { version } from '../../package.json';
import { useQuasar } from 'quasar';

import CodeBlock from 'src/components/ui/CodeBlock.vue';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';
import { Device } from '@capacitor/device';
import { computedAsync } from '@vueuse/core';

const $q = useQuasar();

const prettyQuasarPlatform = [
  ...Object.keys($q.platform.is).map(
    (key: string) =>
      `  ${key}: ${$q.platform.is[key as keyof typeof $q.platform.is]}`
  ),
  ` standalone: ${process.env.CLIENT && !!window.navigator.standalone}`,
].join('\n');

const { orgNoteApi } = useOrgNoteApiStore();

const encryption = orgNoteApi.configuration().encryption;

const getEncryptionData = () => {
  if (
    !encryption.type ||
    encryption.type === ModelsPublicNoteEncryptionTypeEnum.Disabled
  ) {
    return '';
  }

  if (encryption.type === ModelsPublicNoteEncryptionTypeEnum.GpgPassword) {
    return `\n  Password provided: ${!!encryption.password}`;
  }

  return `\n  Public key provided: ${!!encryption.publicKey}
  Private key provided: ${!!encryption.privateKey}
  Passphrase provided: ${!!encryption.privateKeyPassphrase}`;
};

const getDeviceSpecificInfo = async () => {
  if (!$q.platform.is.nativeMobile) {
    return '';
  }
  const info = await Device.getInfo();
  return `\nDevice info:
  Model: ${info.model}
  Manufacturer: ${info.manufacturer}
  ${$q.platform.is.android ? 'SDK version: ' + info.androidSDKVersion : ''}
  Version: ${info.osVersion}`;
};

const systemInfo = computedAsync(
  async () => `OrgNote: ${version}
Language: ${navigator.language}

Screen:
  Screen resolution: ${screen.width}x${screen.height}
  Screen color depth: ${screen.colorDepth}
  Device pixel ratio: ${process.env.CLIENT && window.devicePixelRatio}

Encryption:
  Type: ${encryption.type}${getEncryptionData()}

Env:
  API URL: ${process.env.API_URL || ''}
  AUTH URL: ${process.env.AUTH_URL}
  MODE: ${process.env.NODE_ENV}

Quasar info:
${prettyQuasarPlatform}
${await getDeviceSpecificInfo()}`
);
</script>

<style lang="scss" scoped>
.system-info {
  white-space: pre-line;
}
.debug-page {
  padding: var(--block-padding-md);
}
</style>
