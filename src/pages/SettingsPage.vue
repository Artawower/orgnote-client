<template>
  <component-tabs :tabs="configTabs" />
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores';

import ApiSettingsPage from './ApiSettingsPage.vue';
import CommonSettingsPage from './CommonSettingsPage.vue';
import KeybindingsPage from './KeybindingsPage.vue';
import SubscriptionInfoPage from './SubscriptionInfoPage.vue';
import { Tab } from 'src/components/ui/ComponentTabs.vue';
import ComponentTabs from 'src/components/ui/ComponentTabs.vue';
import ViewSettingsPage from 'src/pages/ViewSettingsPage.vue';
import EncryptionSettingsPage from './EncryptionSettingsPage.vue';

const authStore = useAuthStore();

const configTabs: Tab[] = [
  {
    name: 'common',
    icon: 'settings',
    component: CommonSettingsPage,
  },
  {
    name: 'visual',
    icon: 'tune',
    component: ViewSettingsPage,
  },
  {
    name: 'keybindings',
    icon: 'keyboard',
    component: KeybindingsPage,
  },
  {
    name: 'susbscription',
    icon: 'workspace_premium',
    component: SubscriptionInfoPage,
    disabled: authStore.user.isAnonymous,
  },
  {
    name: 'encryption',
    icon: 'lock',
    component: EncryptionSettingsPage,
  },
  {
    name: 'api',
    icon: 'generating_tokens',
    disabled: authStore.user.isAnonymous || !authStore.user.active,
    disabledReason: 'available to subscribers only',
    component: ApiSettingsPage,
  },
];
</script>

<style lang="scss" scoped>
.settings-groups {
  /* width: 200px; */
  width: auto;
}
.configs {
  flex: 1;
  padding-top: 16px;
}
</style>
