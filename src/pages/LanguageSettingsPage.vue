<template>
  <div class="page">
    <navigation-header />

    <menu-group
      :items="languageMenuItems"
      title="pick language"
      :select-compare-function="langEqual"
      type="select"
      v-model="settingsStore.locale"
    />
  </div>
</template>

<script lang="ts" setup>
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import { useSettingsStore } from 'src/stores/settings';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';

type Locale = string;

const langEqual = (val1: Locale, val2: Locale) => val1 === val2;

const languageMenuItems: MenuItemProps[] = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: 'Russian',
    value: 'ru-RU',
  },
];

const settingsStore = useSettingsStore();
</script>
