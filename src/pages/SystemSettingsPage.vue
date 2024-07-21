<template>
  <navigation-header />
  <menu-group :group-config="clearAllDataConfig" />
  <settings-description
    :text="
      $t(
        'be careful, all local data will be purged, unsaved notes will be lost'
      )
    "
  />
  <menu-group :group-config="removeAccountConfig" />
  <settings-description
    :text="
      $t(
        'deleting an account is an irreversible operation. We do not store your data after deletion and therefore it cannot be recovered.'
      )
    "
  />
</template>

<script lang="ts" setup>
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import MenuGroup, { MenuGroupConfig } from 'src/components/ui/MenuGroup.vue';
import SettingsDescription from 'src/components/ui/SettingsDescription.vue';
import { useI18n } from 'vue-i18n';
import { db } from 'src/boot/repositories';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';
import { RouteNames } from 'src/router/routes';
import { useRouter } from 'vue-router';
import { getCssVar } from 'src/tools';
import { useAuthStore } from 'src/stores/auth';

const { orgNoteApi } = useOrgNoteApiStore();

const router = useRouter();

const { t } = useI18n();

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

const clearAllDataConfig: MenuGroupConfig = {
  items: [
    {
      label: t('clear all local data'),
      handler: clearAllData,
      color: getCssVar('red'),
      disableNarrow: true,
    },
  ],
};

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

const removeAccountConfig: MenuGroupConfig = {
  items: [
    {
      label: t('remove account'),
      handler: removeAccount,
      disabled: !authStore.user || authStore.user?.isAnonymous,
      color: getCssVar('red'),
      disableNarrow: true,
    },
  ],
};
</script>

<style lang="scss" scoped>
.description {
  padding-bottom: var(--block-margin-md);
}
</style>
