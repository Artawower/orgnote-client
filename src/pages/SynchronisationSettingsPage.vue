<template>
  <navigation-header />

  <menu-group :group-config="forceSyncConfig" />
  <settings-description
    :text="
      $t(
        'this functionality will completely clear the local cache and reload all notes from an external source. Important: Unsaved notes will be deleted.'
      )
    "
  />
</template>

<script lang="ts" setup>
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import MenuGroup, { MenuGroupConfig } from 'src/components/ui/MenuGroup.vue';
import SettingsDescription from 'src/components/ui/SettingsDescription.vue';
import { db } from 'src/boot/repositories';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';
import { RouteNames } from 'src/router/routes';
import { getCssVar } from 'src/tools/css-variables';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const authStore = useAuthStore();

const { t } = useI18n();

const forceResync = async () => {
  localStorage.removeItem('sync');
  await db.dropAll();
  await router.push({ name: RouteNames.Home });
  window.location.reload();
};

const forceSyncConfig: MenuGroupConfig = {
  items: [
    {
      label: t('force sync'),
      disabled: authStore.user?.isAnonymous,
      handler: forceResync,
      color: getCssVar('blue'),
      disableNarrow: true,
    },
  ],
};
</script>
