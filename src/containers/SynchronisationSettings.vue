<template>
  <app-flex column start align-start gap="md">
    <settings-scheme :scheme="syncScheme" path="synchronization"></settings-scheme>
    <template v-if="syncAvailable">
      <app-description v-if="!user" padded>
        <div class="capitalize">{{ t(I18N.AVAILABLE_FOR_SUBSCRIPTION) }}</div>
      </app-description>

      <card-wrapper v-if="user && !user.active">
        <menu-item type="warning" icon="warning">
          {{ t(I18N.AVAILABLE_FOR_SUBSCRIPTION) }}
        </menu-item>
        <command-menu-item :command="DefaultCommands.SUBSCRIPTION_SETTINGS" />
      </card-wrapper>

      <api-settings />

      <app-description>{{ t(I18N.SYNC_PROFILE_CONFIG_DESCRIPTION) }}</app-description>

      <card-wrapper>
        <command-menu-item :command="DefaultCommands.EXPORT_LOCAL_SYNC_CONFIG" />
        <command-menu-item :command="DefaultCommands.DOWNLOAD_LOCAL_SYNC_CONFIG" />
      </card-wrapper>

      <card-wrapper>
        <command-menu-item
          :command="DefaultCommands.SYNC_FILES"
          type="danger"
          :disabled="!user || !user.active"
        >
          <div class="capitalize text-medium">{{ t(I18N.FORCE_SYNC) }}</div>
        </command-menu-item>
      </card-wrapper>
      <app-description>{{ t(I18N.FORCE_SYNC_DESCRIPTION) }}</app-description>
    </template>
  </app-flex>
</template>

<script lang="ts" setup>
import { DefaultCommands, I18N, ORG_NOTE_CONFIG_SCHEMA } from 'orgnote-api';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import AppDescription from 'src/components/AppDescription.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import { valibotScheme } from 'src/models/valibot-scheme';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ApiSettings from './ApiSettings.vue';
import SettingsScheme from './SettingsScheme.vue';
import CommandMenuItem from './CommandMenuItem.vue';
import MenuItem from './MenuItem.vue';
import AppFlex from 'src/components/AppFlex.vue';

const syncScheme = valibotScheme(ORG_NOTE_CONFIG_SCHEMA.entries.synchronization);
const settings = api.core.useSettings();
settings.loadApiTokens();

const authStore = api.core.useAuth();
const { user } = storeToRefs(authStore);

const { config } = storeToRefs(api.core.useConfig());

const syncAvailable = computed(
  () => config.value.synchronization.type && config.value.synchronization.type !== 'none',
);

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>
