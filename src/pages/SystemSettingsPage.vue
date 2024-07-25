<template>
  <navigation-header />

  <menu-group :items="clearAllDataMenuItems" />
  <settings-description
    text="be careful, all local data will be purged, unsaved notes will be lost"
  />
  <menu-group :items="removeAccountMenuItems" />
  <settings-description
    text="deleting an account is an irreversible operation. We do not store your data after deletion and therefore it cannot be recovered."
  />
</template>

<script lang="ts" setup>
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import SettingsDescription from 'src/components/ui/SettingsDescription.vue';
import { db } from 'src/boot/repositories';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';
import { RouteNames } from 'src/router/routes';
import { useRouter } from 'vue-router';
import { getCssVar } from 'src/tools';
import { useAuthStore } from 'src/stores/auth';
import { MenuButtonProps } from 'src/components/ui/MenuGroupButton.vue';

const { orgNoteApi } = useOrgNoteApiStore();

const router = useRouter();

const clearAllData = async () => {
  const clear = await orgNoteApi.interaction.confirm(
    'clear all local data',
    'are you sure you want to delete all data?'
  );

  if (!clear) {
    return;
  }

  await router.push({ name: RouteNames.Home });
  localStorage.clear();
  await db.dropAll();
  window.location.reload();
};

const authStore = useAuthStore();

const clearAllDataMenuItems: MenuButtonProps[] = [
  {
    label: 'clear all local data',
    handler: clearAllData,
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

const removeAccountMenuItems: MenuButtonProps[] = [
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
