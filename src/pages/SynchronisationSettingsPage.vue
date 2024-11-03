<template>
  <navigation-page>
    <menu-group title="synchronization type" :items="syncTypeItems" />

    <template v-if="$q.platform.is.nativeMobile">
      <menu-group title="vault path" :items="pathPickItems" />
      <the-description
        v-if="!config.vault.path"
        type="error"
        text="to continue working, you need to select the directory where the notes will be stored"
      />
    </template>

    <menu-group :items="forceSyncItems" />
    <the-description
      text="this functionality will completely clear the local cache and reload all notes from an external source. Important: Unsaved notes will be deleted."
    />

    <template v-if="$q.platform.is.android">
      <menu-group :items="androidPermissionsItems" />
      <the-description
        v-if="!fileSystemStore.hasAccess"
        type="warning"
        text="there is no access to the file system! The app can’t read external notes."
      />
    </template>
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
import { useSyncStore } from 'src/stores/sync';
import { useFileSystemStore } from 'src/stores/file-system.store';
import { DefaultCommands } from 'orgnote-api';
import { useKeybindingStore } from 'src/stores/keybindings';
import { AndroidFolderPicker } from 'src/plugins/android-folder-picker.plugin';

const authStore = useAuthStore();

const syncStore = useSyncStore();
const { config } = useSettingsStore();

const fileSystemStore = useFileSystemStore();

const forceSyncItems: MenuItemProps[] = [
  {
    label: 'force sync',
    disabled: computed(
      () =>
        authStore.user?.isAnonymous || config.synchronization.type === 'none'
    ),
    handler: () => syncStore.forceResync(),
    color: getCssVar('blue'),
  },
];

const syncTypeItems: MenuItemProps[] = buildMenuItems(config.synchronization, {
  configScheme: SYNCHRONIZATION_CONFIG_SCHEME,
  excludeKeys: ['path'],
});

const pathPickItems: MenuItemProps[] = [
  {
    label: 'path',
    reactivePath: config.vault,
    reactiveKey: 'path',
    type: 'readonly',
  },
  {
    label: 'select dir',
    type: 'action',
    color: getCssVar('blue'),
    handler: async () => {
      const res = await AndroidFolderPicker.pickFolder();
      config.vault.path = res.path;
      executeCommand({ command: DefaultCommands.SYNC_FILES });
    },
  },
];

const { executeCommand } = useKeybindingStore();

const androidPermissionsItems: MenuItemProps[] = [
  {
    label: 'open persmissions',
    handler: async () => {
      await fileSystemStore.openPermissions();
      if (!fileSystemStore.hasAccess) {
        return;
      }
      executeCommand({
        command: DefaultCommands.SYNC_FILES,
      });
    },
    color: getCssVar('blue'),
  },
];
const $q = useQuasar();
</script>
