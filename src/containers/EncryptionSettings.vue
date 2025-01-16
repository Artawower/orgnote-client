<template>
  <settings-scheme :scheme="encryptionScheme" path="encryption"></settings-scheme>
  <template v-if="config.encryption.type === 'gpgKeys'">
    <card-wrapper>
      <menu-item type="danger">
        {{ t(TXT_GENERATE_GPG_KEYS) }}
      </menu-item>
    </card-wrapper>
    <app-description v-if="config.encryption.type === 'gpgKeys'">
      {{ t(TXT_ENCRYPTION_KEYS_GEN_WARNING) }}
    </app-description>
  </template>
  <card-wrapper>
    <menu-item type="danger">
      {{ t(TXT_ENCRYPT_AND_SYNC) }}
    </menu-item>
  </card-wrapper>
</template>

<script lang="ts" setup>
import {
  ORG_NOTE_CONFIG_SCHEMA,
  TXT_ENCRYPT_AND_SYNC,
  TXT_ENCRYPTION_KEYS_GEN_WARNING,
  TXT_GENERATE_GPG_KEYS,
} from 'orgnote-api';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import AppDescription from 'src/components/AppDescription.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import { useI18n } from 'vue-i18n';
import MenuItem from './MenuItem.vue';
import SettingsScheme from './SettingsScheme.vue';
import { valibotScheme } from 'src/models/valibot-scheme';

const encryptionScheme = valibotScheme({ ...ORG_NOTE_CONFIG_SCHEMA.entries.encryption });
console.log('✎: [line 11][EncryptionSettings.vue] encryptionEntries: ', encryptionScheme);

const { config } = storeToRefs(api.core.useSettings());

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>
