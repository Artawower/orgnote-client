<template>
  <navigation-header />

  <menu-group :items="extensionsSettingsItems" />
</template>

<script lang="ts" setup>
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';

const extensionsSettingsItems: MenuItemProps[] = [];
</script>
