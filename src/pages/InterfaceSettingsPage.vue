<template>
  <navigation-page>
    <menu-group title="common" :items="commonGroupMenu" />
    <menu-group title="theme" :items="themeGroupMenu" />
    <menu-group title="editor" :items="editorGroupMenu" />
    <menu-group title="completion" :items="completionGroupMenu" />
  </navigation-page>
</template>

<script lang="ts" setup>
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import NavigationPage from 'src/components/ui/NavigationPage.vue';

import { MenuItemProps } from 'src/components/ui/MenuItem.vue';
import { useSettingsStore } from 'src/stores/settings';
import { buildMenuItems } from 'src/tools/config-menu-builder';
import {
  COMPLETION_CONFIG_SCHEME,
  UI_CONFIG_SCHEME,
} from 'src/constants/default-config.constant';

const { config } = useSettingsStore();

const editorGroupMenu: MenuItemProps[] = buildMenuItems(config.editor);

const commonGroupMenu: MenuItemProps[] = buildMenuItems(config.ui, {
  configScheme: UI_CONFIG_SCHEME,
  excludeKeys: ['theme'],
});

const themeGroupMenu = buildMenuItems(config.ui, {
  configScheme: UI_CONFIG_SCHEME,
  includeKeys: ['theme'],
});

const completionGroupMenu: MenuItemProps[] = buildMenuItems(config.completion, {
  configScheme: COMPLETION_CONFIG_SCHEME,
});
</script>
