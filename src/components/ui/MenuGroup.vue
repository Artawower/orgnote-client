<template>
  <the-description v-if="title" class="title" :title="true" :text="title" />
  <div class="menu-group" :class="border ? 'bordered' : ''">
    <div class="items">
      <menu-item
        @click="handleItem(item)"
        v-for="(item, i) of items"
        v-bind:key="item.label"
        v-bind="item"
        :selected="type === 'select' && item.value === props.modelValue"
        :round-borders="getBorderRadiusType(i)"
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
        <template
          v-for="(slot, index) of Object.keys($slots)"
          :key="index"
          v-slot:[slot]
        >
          <slot :name="slot" :value="item.value" :data="item.data"></slot>
        </template>
      </menu-item>
    </div>
  </div>
  <actions-popup
    v-model="actionsPopup"
    @close="closePopup"
    :popup-menu-group="popupMenuGroup"
  />
</template>

<script lang="ts">
import ActionsPopup from './ActionsPopup.vue';
import { ref, toValue } from 'vue';
import { useQuasar } from 'quasar';
import ActionBtn from './ActionBtn.vue';
import TheDescription from './TheDescription.vue';

export interface MenuGroupProps<TValue = unknown> {
  selectCompareFunction?: (val1: TValue, val2: TValue) => boolean;
  title?: string;
  icon?: string;
  border?: boolean;
  type?: 'select';
  items: MenuItemProps[];
  modelValue?: unknown;
}
</script>

<script lang="ts" setup generic="T = unknown">
import MenuItem, { MenuItemProps } from './MenuItem.vue';

const props = defineProps<MenuGroupProps<T>>();

const emits = defineEmits<{
  (e: 'handled', item: MenuItemProps): void;
  (e: 'update:modelValue', val: unknown): void;
  (e: 'selected', val: unknown): void;
}>();

const popupMenuGroup = ref<MenuGroupProps>(null);
const actionsPopup = ref(false);

const getBorderRadiusType = (index: number): 'top' | 'bottom' | 'full' => {
  if (props.items.length == 1) {
    return 'full';
  }
  if (index == 0) {
    return 'top';
  }
  if (index == props.items.length - 1) {
    return 'bottom';
  }
};

const $q = useQuasar();

const handleItem = (item: MenuItemProps) => {
  if (toValue(item.disabled)) {
    return;
  }
  handleSelectItem(item) ||
    handleActionItem(item) ||
    handleMenuPopup(item) ||
    handleToggleItem(item);
  emits('handled', item);
};

const handleSelectItem = (item: MenuItemProps): boolean => {
  if (item.type !== 'select') {
    return;
  }
  emits('update:modelValue', item.value);
  emits('selected', item.value);
  return true;
};

const handleActionItem = (item: MenuItemProps): boolean => {
  if (!item.handler) {
    return;
  }
  item.handler();
  return true;
};

const handleMenuPopup = (item: MenuItemProps) => {
  if (!item.popupMenuGroup || !$q.platform.is.mobile) {
    return;
  }
  popupMenuGroup.value = item.popupMenuGroup;
  actionsPopup.value = true;
  return true;
};

const handleToggleItem = (item: MenuItemProps) => {
  if (item.type !== 'toggle') {
    return;
  }
  if (item.value !== undefined) {
    item.value = !item.value;
  }
  const val = item?.reactivePath[item?.reactiveKey];
  if (val !== undefined) {
    item.reactivePath[item.reactiveKey] = !val;
  }
};

const closePopup = () => {
  actionsPopup.value = false;
  popupMenuGroup.value = null;
};
</script>

<style lang="scss" scoped>
.menu-group {
  box-sizing: border-box;
  border-radius: var(--block-border-radius-md);
  width: 100%;
  background: var(--bg-alt2, --bg-alt);

  &.bordered {
    border: var(--border-main);
  }
}
</style>
