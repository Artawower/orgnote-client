<template>
  <settings-scheme :entries="syncEntries" path="ui"></settings-scheme>
  <card-wrapper background="bg-alt2">
    <menu-item color="blue" :disabled="true">
      <div class="capitalize text-bold color-blue">{{ t(TXT_FORCE_SYNC) }}</div>
    </menu-item>
  </card-wrapper>
  <app-description>{{ t(TXT_FORCE_SYNC_DESCRIPTION) }}</app-description>
</template>

<script lang="ts" setup>
import { ORG_NOTE_CONFIG_SCHEMA, TXT_FORCE_SYNC_DESCRIPTION, TXT_FORCE_SYNC } from 'orgnote-api';
import SettingsScheme from './SettingsScheme.vue';
import AppDescription from 'src/components/AppDescription.vue';
import MenuItem from './MenuItem.vue';
import { useI18n } from 'vue-i18n';
import CardWrapper from 'src/components/CardWrapper.vue';

const syncEntries = ORG_NOTE_CONFIG_SCHEMA.entries.synchronization.entries;

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>
