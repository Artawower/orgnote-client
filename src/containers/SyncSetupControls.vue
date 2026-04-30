<template>
  <app-flex column start align-start gap="md" full-width>
    <settings-scheme class="sync-scheme" :scheme="syncScheme" path="synchronization" />
    <api-settings v-if="syncAvailable" />

    <template v-if="canCopySyncProfile">
      <app-description :center="centerDescriptions">
        {{ t(I18N.SYNC_PROFILE_CONFIG_DESCRIPTION) }}
      </app-description>
      <card-wrapper>
        <command-menu-item :command="DefaultCommands.EXPORT_LOCAL_SYNC_CONFIG" />
        <command-menu-item :command="DefaultCommands.DOWNLOAD_LOCAL_SYNC_CONFIG" />
        <command-menu-item :command="DefaultCommands.COPY_EMACS_USE_PACKAGE_CONFIG" />
      </card-wrapper>
    </template>

    <app-description v-else-if="showUnavailable" :center="centerDescriptions" padded>
      {{ t(I18N.SYNC_PROFILE_CONFIG_UNAVAILABLE) }}
    </app-description>
  </app-flex>
</template>

<script lang="ts" setup>
import { DefaultCommands, I18N, ORG_NOTE_CONFIG_SCHEMA } from 'orgnote-api';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import AppDescription from 'src/components/AppDescription.vue';
import AppFlex from 'src/components/AppFlex.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import ApiSettings from 'src/containers/ApiSettings.vue';
import CommandMenuItem from 'src/containers/CommandMenuItem.vue';
import SettingsScheme from 'src/containers/SettingsScheme.vue';
import { valibotScheme } from 'src/models/valibot-scheme';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    centerDescriptions?: boolean;
    requireActiveUserForUnavailable?: boolean;
  }>(),
  {
    centerDescriptions: false,
    requireActiveUserForUnavailable: false,
  },
);

const syncScheme = valibotScheme(ORG_NOTE_CONFIG_SCHEMA.entries.synchronization);
const settings = api.core.useSettings();
settings.loadApiTokens();

const authStore = api.core.useAuth();
const { user } = storeToRefs(authStore);
const { tokens } = storeToRefs(settings);
const { config } = storeToRefs(api.core.useConfig());
const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const syncAvailable = computed(
  () => config.value.synchronization.type && config.value.synchronization.type !== 'none',
);

const canCopySyncProfile = computed(() => syncAvailable.value && tokens.value.length > 0);
const showUnavailable = computed(
  () => !props.requireActiveUserForUnavailable || Boolean(user.value?.active),
);
</script>

<style lang="scss" scoped>
.sync-scheme {
  width: 100%;
}
</style>
