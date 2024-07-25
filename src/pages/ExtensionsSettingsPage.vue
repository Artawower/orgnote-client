<template>
  <navigation-header />

  <menu-group :items="extensionsSettingsItems" />
</template>

<script lang="ts" setup>
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import { MenuButtonProps } from 'src/components/ui/MenuGroupButton.vue';

const extensionsSettingsItems: MenuButtonProps[] = [];
</script>
