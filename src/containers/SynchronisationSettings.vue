<template>
  <settings-scheme :scheme="syncScheme" path="ui"></settings-scheme>
  <card-wrapper>
    <menu-item type="info" :disabled="true">
      <div class="capitalize text-bold">{{ t(I18N.FORCE_SYNC) }}</div>
    </menu-item>
  </card-wrapper>
  <app-description>{{ t(I18N.FORCE_SYNC_DESCRIPTION) }}</app-description>
</template>

<script lang="ts" setup>
import { ORG_NOTE_CONFIG_SCHEMA, I18N } from 'orgnote-api';
import SettingsScheme from './SettingsScheme.vue';
import AppDescription from 'src/components/AppDescription.vue';
import MenuItem from './MenuItem.vue';
import { useI18n } from 'vue-i18n';
import CardWrapper from 'src/components/CardWrapper.vue';
import { valibotScheme } from 'src/models/valibot-scheme';

const syncScheme = valibotScheme(ORG_NOTE_CONFIG_SCHEMA.entries.synchronization);

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>
