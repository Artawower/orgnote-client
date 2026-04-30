<template>
  <page-wrapper centered>
    <app-flex column center align-center gap="md" full-width>
      <app-title :level="2" center>
        {{ t(I18N.ONBOARDING_SYNC_TITLE) }}
      </app-title>
      <app-description center>
        {{ t(I18N.ONBOARDING_SYNC_DESCRIPTION) }}
      </app-description>

      <settings-scheme class="sync-scheme" :scheme="syncScheme" path="synchronization" />
      <api-settings v-if="syncAvailable" />

      <template v-if="canCopySyncProfile">
        <app-description center>
          {{ t(I18N.SYNC_PROFILE_CONFIG_DESCRIPTION) }}
        </app-description>
        <card-wrapper>
          <command-menu-item :command="DefaultCommands.EXPORT_LOCAL_SYNC_CONFIG" />
          <command-menu-item :command="DefaultCommands.DOWNLOAD_LOCAL_SYNC_CONFIG" />
          <command-menu-item :command="DefaultCommands.COPY_EMACS_USE_PACKAGE_CONFIG" />
        </card-wrapper>
      </template>

      <app-description v-else center>
        {{ t(I18N.SYNC_PROFILE_CONFIG_UNAVAILABLE) }}
      </app-description>
    </app-flex>
  </page-wrapper>
</template>

<script lang="ts" setup>
import { DefaultCommands, I18N, ORG_NOTE_CONFIG_SCHEMA } from 'orgnote-api';
import { storeToRefs } from 'pinia';
import PageWrapper from 'src/components/PageWrapper.vue';
import AppDescription from 'src/components/AppDescription.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppTitle from 'src/components/AppTitle.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import { api } from 'src/boot/api';
import ApiSettings from 'src/containers/ApiSettings.vue';
import CommandMenuItem from 'src/containers/CommandMenuItem.vue';
import SettingsScheme from 'src/containers/SettingsScheme.vue';
import { valibotScheme } from 'src/models/valibot-scheme';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const syncScheme = valibotScheme(ORG_NOTE_CONFIG_SCHEMA.entries.synchronization);
const settings = api.core.useSettings();
settings.loadApiTokens();

const { tokens } = storeToRefs(settings);
const { config } = storeToRefs(api.core.useConfig());
const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const syncAvailable = computed(
  () => config.value.synchronization.type && config.value.synchronization.type !== 'none',
);

const canCopySyncProfile = computed(() => syncAvailable.value && tokens.value.length > 0);
</script>

<style lang="scss" scoped>
.sync-scheme {
  width: 100%;
}
</style>
