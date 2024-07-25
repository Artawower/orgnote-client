<template>
  <navigation-header />

  <menu-group title="developer" :items="developerGroupMenu" />
</template>

<script lang="ts" setup>
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import { MenuButtonProps } from 'src/components/ui/MenuGroupButton.vue';
import { useSettingsStore } from 'src/stores/settings';
import { buildMenuItems } from 'src/tools/config-menu-builder';

const { config } = useSettingsStore();

const developerGroupMenu: MenuButtonProps[] = buildMenuItems(config.developer);
</script>
