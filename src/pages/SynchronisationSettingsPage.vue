<template>
  <navigation-page>
    <menu-group title="synchronization type" :items="syncTypeItems" />
    <menu-group
      title="vault path"
      v-if="dirSyncAvailable"
      :items="pathPickItems"
    />
    <the-description
      text="this functionality in development right now. It's not possible to sync notes with the filesystem yet."
    />
    <menu-group :items="forceSyncItems" />
    <the-description
      text="this functionality will completely clear the local cache and reload all notes from an external source. Important: Unsaved notes will be deleted."
    />
  </navigation-page>
</template>

<script lang="ts" setup>
import NavigationPage from 'src/components/ui/NavigationPage.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import TheDescription from 'src/components/ui/TheDescription.vue';
import { useAuthStore } from 'src/stores/auth';
import { getCssVar } from 'src/tools/css-variables';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';
import { useSettingsStore } from 'src/stores/settings';
import { buildMenuItems } from 'src/tools/config-menu-builder';
import { SYNCHRONIZATION_CONFIG_SCHEME } from 'src/constants/default-config.constant';
import { computed } from 'vue';
import { useQuasar } from 'quasar';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';
import { useSyncStore } from 'src/stores/sync';

const authStore = useAuthStore();

const dirSyncAvailable = computed(
  () => $q.platform.is.mobile && config.synchronization.type === 'filesystem'
);

const syncStore = useSyncStore();
const forceSyncItems: MenuItemProps[] = [
  {
    label: 'force sync',
    disabled: authStore.user?.isAnonymous,
    handler: () => syncStore.forceResync(),
    color: getCssVar('blue'),
  },
];

const { config } = useSettingsStore();
const syncTypeItems: MenuItemProps[] = buildMenuItems(config.synchronization, {
  configScheme: SYNCHRONIZATION_CONFIG_SCHEME,
  excludeKeys: ['path'],
});

const { orgNoteApi } = useOrgNoteApiStore();

const pathPickItems: MenuItemProps[] = [
  {
    label: 'path',
    reactivePath: config.synchronization,
    reactiveKey: 'path',
    type: 'readonly',
  },
  {
    label: 'select dir',
    type: 'action',
    color: getCssVar('blue'),
    handler: async () => {
      const path = await orgNoteApi.fileSystem.readPath();
      config.synchronization.path = path;
    },
  },
];

const $q = useQuasar();
</script>
