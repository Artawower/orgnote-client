<template>
  <div class="menu-group" :class="groupConfig.border ? 'bordered' : ''">
    <div v-if="groupConfig.title" class="title">{{ groupConfig.title }}</div>
    <div class="items">
      <menu-group-button
        @click="handleItem(item)"
        v-for="(item, i) of groupConfig.items"
        v-bind:key="item.label"
        :label="item.label"
        :icon="item.icon"
        :icon-background-color="item.iconBackgroundColor"
        :disable-narrow="item.disableNarrow"
        :active="item.active"
        :disabled="item.disabled"
        :round-borders="getBorderRadiusType(i)"
        :color="item.color"
        :action-icon="item.actionIcon"
        :active-action-icon="item.activeActionIcon"
      >
        <template
          v-if="$q.platform.is.desktop && item.popupMenuGroup?.items?.length"
          v-slot:right-actions
        >
          <action-btn
            v-for="popupItem of item.popupMenuGroup?.items"
            v-bind:key="popupItem.label"
            @click="popupItem.handler()"
            :icon="popupItem.actionIcon"
            :active-icon="popupItem.activeActionIcon"
          />
        </template>
      </menu-group-button>
    </div>
  </div>
  <actions-popup
    v-if="popupMenuGroup"
    @close="closePopup"
    :popup-menu-group="popupMenuGroup"
  />
</template>

<script lang="ts">
import ActionsPopup from './ActionsPopup.vue';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import ActionBtn from './ActionBtn.vue';

export interface MenuItem {
  label: string;
  icon?: string;
  iconBackgroundColor?: string;
  color?: string;
  handler?: () => void;
  disableNarrow?: boolean;
  disabled?: boolean;
  active?: boolean;
  popupMenuGroup?: MenuGroupConfig;
  actionIcon?: string;
  activeActionIcon?: string;
}

export interface MenuGroupConfig {
  title?: string;
  border?: boolean;
  items: MenuItem[];
}
</script>

<script lang="ts" setup>
import MenuGroupButton from './MenuGroupButton.vue';

const props = defineProps<{
  groupConfig: MenuGroupConfig;
}>();

const emits = defineEmits<{
  (e: 'handled', item: MenuItem): void;
}>();

const popupMenuGroup = ref<MenuGroupConfig>(null);

const getBorderRadiusType = (index: number): 'top' | 'bottom' | 'full' => {
  if (props.groupConfig.items.length == 1) {
    return 'full';
  }
  if (index == 0) {
    return 'top';
  }
  if (index == props.groupConfig.items.length - 1) {
    return 'bottom';
  }
};

const $q = useQuasar();

const handleItem = (item: MenuItem) => {
  if (item.disabled) {
    return;
  }
  if (item.handler) {
    item.handler();
  } else if (item.popupMenuGroup && $q.platform.is.mobile) {
    popupMenuGroup.value = item.popupMenuGroup;
  }
  emits('handled', item);
};

const closePopup = () => {
  popupMenuGroup.value = null;
};
</script>

<style lang="scss" scoped>
.menu-group {
  box-sizing: border-box;
  border-radius: var(--block-border-radius-md);
  /* width: 100%; */
  background: var(--bg-alt2, --bg-alt);
  margin: var(--block-margin-xs);

  &.bordered {
    border: var(--border-main);
  }
}
</style>
