<template>
  <component-tabs :tabs="configTabs"> </component-tabs>
</template>

<script lang="ts" setup>
import { VueComponent } from 'src/models';
import { useAuthStore } from 'src/stores';

import { shallowRef } from 'vue';

import ApiSettingsPage from './ApiSettingsPage.vue';
import CommonSettingsPage from './CommonSettingsPage.vue';
import KeybindingsPage from './KeybindingsPage.vue';
import { Tab } from 'src/components/ui/ComponentTabs.vue';
import ComponentTabs from 'src/components/ui/ComponentTabs.vue';
import ViewSettingsPage from 'src/pages/ViewSettingsPage.vue';

const authStore = useAuthStore();

const configTabs: Tab[] = [
  {
    name: 'visual',
    icon: 'tune',
    component: ViewSettingsPage,
  },
  {
    name: 'common',
    icon: 'settings',
    component: CommonSettingsPage,
  },
  {
    name: 'keybindings',
    icon: 'keyboard',
    component: KeybindingsPage,
  },
  {
    name: 'api',
    icon: 'generating_tokens',
    disabled: authStore.user.isAnonymous,
    component: ApiSettingsPage,
  },
];
const configComponent = shallowRef<VueComponent>(ViewSettingsPage);

const openTab = (component: VueComponent) => {
  configComponent.value = component;
};
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
