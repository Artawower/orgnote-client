<template>
  <navigation-page>
    <menu-group title="developer" :items="developerGroupMenu" />
  </navigation-page>
</template>

<script lang="ts" setup>
import NavigationPage from 'src/components/ui/NavigationPage.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';
import { useSettingsStore } from 'src/stores/settings';
import { buildMenuItems } from 'src/tools/config-menu-builder';
import { DEVELOPER_CONFIG_SCHEME } from 'src/constants/default-config.constant';

const { config } = useSettingsStore();

const developerGroupMenu: MenuItemProps[] = buildMenuItems(config.developer, {
  configScheme: DEVELOPER_CONFIG_SCHEME,
});
</script>
