<template>
  <div class="settings flex cols">
    <q-list class="settings-groups">
      <q-item
        v-for="tab of configTabs"
        @click="openTab(tab.component)"
        :disable="tab?.disabled"
        :key="tab.name"
        :active="configComponent.__name === tab.component.__name"
        clickable
        class="rounded-borders justify-start"
      >
        <q-item-section avatar>
          <q-icon :name="tab.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-capitalize">{{
            $t(tab.name)
          }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <div class="configs q-pl-md">
      <component :is="configComponent"></component>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VueComponent } from 'src/models';
import { useAuthStore } from 'src/stores';

import { shallowRef } from 'vue';

import ApiSettingsPage from './ApiSettingsPage.vue';
import CommonSettingsPage from './CommonSettingsPage.vue';
import KeybindingsPage from './KeybindingsPage.vue';
import ViewSettingsPage from 'src/pages/ViewSettingsPage.vue';

interface Tab {
  name: string;
  icon: string;
  component: VueComponent;
  disabled?: boolean;
}

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
  width: 200px;
}
.configs {
  flex: 1;
}
</style>
