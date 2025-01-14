<template>
  <div class="settings-menu">
    <card-wrapper v-for="(menuItems, key) of settingsMenu" :key="key" background="bg-alt2">
      <menu-item
        v-for="(menuItem, i) of menuItems"
        :key="i"
        @click="execute(menuItem.command)"
        :icon="menuItem.icon"
        :active="menuItem?.isActive()"
      >
        <div class="capitalize text-bold">{{ t(menuItem.name) }}</div>
      </menu-item>
    </card-wrapper>
  </div>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from './MenuItem.vue';
import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/api';
import { storeToRefs } from 'pinia';

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const { settingsMenu } = storeToRefs(api.ui.useSettingsUi());
const { execute } = api.core.useCommands();
</script>

<style lang="scss" scoped>
.card-wrapper {
  width: 100%;
}

.settings-menu {
  width: 420px;

  @include desktop-below {
    width: 100%;
  }
}
</style>
