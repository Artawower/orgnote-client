<template>
  <navigation-header />
  <menu-group title="common" :items="commonGroupMenu" />
  <menu-group title="theme" :items="themeGroupMenu" />
  <menu-group title="editor" :items="editorGroupMenu" />
  <menu-group title="completion" :items="completionGroupMenu" />
</template>

<script lang="ts" setup>
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import { MenuButtonProps } from 'src/components/ui/MenuGroupButton.vue';
import { useSettingsStore } from 'src/stores/settings';
import { buildMenuItems } from 'src/tools/config-menu-builder';
import { AVAILABLE_CONFIG_SCHEME } from 'src/constants/default-config.constant';

const { config } = useSettingsStore();

const editorGroupMenu: MenuButtonProps[] = buildMenuItems(config.editor);

const commonGroupMenu: MenuButtonProps[] = buildMenuItems(config.ui, {
  configScheme: AVAILABLE_CONFIG_SCHEME,
  excludeKeys: ['theme'],
});

const themeGroupMenu = buildMenuItems(config.ui, {
  configScheme: AVAILABLE_CONFIG_SCHEME,
  includeKeys: ['theme'],
});

const completionGroupMenu: MenuButtonProps[] = buildMenuItems(
  config.completion,
  {
    configScheme: AVAILABLE_CONFIG_SCHEME,
  }
);
</script>
