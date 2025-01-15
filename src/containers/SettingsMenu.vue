<template>
  <div class="settings-menu">
    <card-wrapper v-for="(menuItems, key) of settingsMenu" :key="key" background="bg-alt2">
      <command-menu-item v-for="(menuItem, i) of menuItems" :key="i" :command="menuItem" />
    </card-wrapper>
  </div>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import { api } from 'src/boot/api';
import { storeToRefs } from 'pinia';
import CommandMenuItem from './CommandMenuItem.vue';

const { settingsMenu } = storeToRefs(api.ui.useSettingsUi());
</script>

<style lang="scss" scoped>
.card-wrapper {
  width: 100%;
}

.settings-menu {
  width: 320px;

  @include desktop-below {
    width: 100%;
  }

  @include flexify(column, flex-start, center, var(--gap-lg));
}
</style>
