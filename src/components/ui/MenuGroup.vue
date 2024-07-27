<template>
  <settings-description
    v-if="title"
    class="title"
    :title="true"
    :text="title"
  />
  <div class="menu-group" :class="border ? 'bordered' : ''">
    <div class="items">
      <menu-item
        @click="handleItem(item)"
        v-for="(item, i) of items"
        v-bind:key="item.label"
        :label="item.label"
        :icon="item.icon"
        :icon-background-color="item.iconBackgroundColor"
        :narrow="item.narrow"
        :disabled="item.disabled"
        :round-borders="getBorderRadiusType(i)"
        :color="item.color"
        :action-icon="item.actionIcon"
        :active-action-icon="item.activeActionIcon"
        :selected="type === 'select' && item.value === props.modelValue"
        :type="item.type"
        :reactive-path="item.reactivePath"
        :reactive-key="item.reactiveKey"
        :value="item.value"
        :data="item.data"
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
import SettingsDescription from './SettingsDescription.vue';

export interface MenuGroupProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectCompareFunction?: (val1: any, val2: any) => boolean;
  title?: string;
  border?: boolean;
  type?: 'select';
  items: MenuItemProps[];
  modelValue?: unknown;
}
</script>

<script lang="ts" setup>
import MenuItem, { MenuItemProps } from './MenuItem.vue';

const props = defineProps<MenuGroupProps>();

const emits = defineEmits<{
  (e: 'handled', item: MenuItemProps): void;
  (e: 'update:modelValue', val: unknown): void;
  (e: 'selected', val: unknown): void;
}>();

const popupMenuGroup = ref<MenuGroupProps>(null);

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
  if (item.disabled) {
    return;
  }
  if (props.type === 'select') {
    emits('update:modelValue', item.value);
    emits('selected', item.value);
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
