<template>
  <settings-scheme :entries="syncEntries" path="ui"></settings-scheme>
  <menu-item></menu-item>
  <app-description>{{ t(TXT_FORCE_SYNC_DESCRIPTION) }}</app-description>
</template>

<script lang="ts" setup>
import { ORG_NOTE_CONFIG_SCHEMA, TXT_FORCE_SYNC_DESCRIPTION } from 'orgnote-api';
import SettingsScheme from './SettingsScheme.vue';
import AppDescription from 'src/components/AppDescription.vue';
import MenuItem from './MenuItem.vue';
import { useI18n } from 'vue-i18n';

const syncEntries = ORG_NOTE_CONFIG_SCHEMA.entries.synchronization.entries;

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>
