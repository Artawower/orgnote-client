<template>
  <navigation-page>
    <menu-group :items="clearAllDataMenuItems" />
    <the-description
      text="be careful, all local data will be purged, unsaved notes will be lost"
    />
    <menu-group :items="removeAccountMenuItems" />
    <the-description
      text="deleting an account is an irreversible operation. We do not store your data after deletion and therefore it cannot be recovered."
    />
  </navigation-page>
</template>

<script lang="ts" setup>
import NavigationPage from 'src/components/ui/NavigationPage.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import TheDescription from 'src/components/ui/TheDescription.vue';
import { db } from 'src/boot/repositories';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';
import { RouteNames } from 'src/router/routes';
import { useRouter } from 'vue-router';
import { getCssVar } from 'src/tools';
import { useAuthStore } from 'src/stores/auth';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';
import { useSettingsStore } from 'src/stores/settings';
import { computed } from 'vue';
import { useNotesStore } from 'src/stores/notes';
import { useFileSystem } from 'src/hooks/file-system';

const { orgNoteApi } = useOrgNoteApiStore();

const router = useRouter();

const fileSystem = useFileSystem();

const confirmDeleteLocalNotes = async () => {
  // TODO: command
  const confirmed = await orgNoteApi.interaction.confirm(
    'clear all local data',
    'are you sure you want to delete all data?'
  );

  if (!confirmed) {
    return;
  }

  await router.push({ name: RouteNames.Home });
  localStorage.clear();
  await db.dropAll();
  await fileSystem.removeAllFiles();
  window.location.reload();
};

const notesStore = useNotesStore();

const clearLocalAndRemoteNotes = async () => {
  const confirmed = await orgNoteApi.interaction.confirm(
    'delete all notes',
    'are you sure you want to delete all notes?'
  );

  if (!confirmed) {
    return;
  }

  await notesStore.removeAllNotes();
};

const authStore = useAuthStore();

const { config } = useSettingsStore();

const clearAllDataMenuItems: MenuItemProps[] = [
  {
    label: 'clear all local data',
    handler: confirmDeleteLocalNotes,
    color: getCssVar('red'),
  },
  {
    label: 'delete all notes',
    disabled: computed(
      () =>
        config.synchronization.type === 'none' || authStore.user?.isAnonymous
    ),
    handler: clearLocalAndRemoteNotes,
    color: getCssVar('red'),
  },
];

const removeAccount = async () => {
  const confirmed = await orgNoteApi.interaction.confirm(
    'remove account',
    'are you sure you want to remove your account?'
  );

  if (!confirmed) {
    return;
  }
  await authStore.removeUserAccount();
};

const removeAccountMenuItems: MenuItemProps[] = [
  {
    label: 'remove account',
    handler: removeAccount,
    disabled: !authStore.user || authStore.user?.isAnonymous,
    color: getCssVar('red'),
  },
];
</script>

<style lang="scss" scoped>
.description {
  padding-bottom: var(--block-margin-md);
}
</style>
