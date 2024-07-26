<template>
  <div
    @click="handleClick"
    v-bind:key="label"
    role="button"
    class="item"
    ref="menuItemRef"
    :class="roundBorders"
  >
    <div
      class="info"
      :class="{
        disabled: disabled,
      }"
    >
      <rounded-icon
        v-if="icon"
        size="sm"
        :name="icon"
        :backgroundColor="iconBackgroundColor"
      />
      <div class="label capitalize" :style="{ color: color }">
        {{ $t(label) }}
      </div>
    </div>
    <input
      v-if="editMode"
      v-model="reactivePath[reactiveKey]"
      :type="editMode"
      ref="editInputRef"
      name="editMode"
    />
    <div v-else class="right-icons">
      <div class="slot-actions">
        <slot name="right-actions" />
      </div>
      <q-icon
        class="narrow-icon"
        v-if="narrow"
        name="sym_o_arrow_forward_ios"
      />
      <q-icon
        class="selected-icon"
        v-if="selected || isSelectable"
        name="sym_o_check"
        size="sm"
      />
      <!-- eslint-disable vue/no-mutating-props -->
      <template v-if="type === 'toggle'">
        <template v-if="!reactivePath">
          <toggle-button
            :modelValue="value"
            @update:modelValue="(value as any) = $event"
          />
        </template>
        <toggle-button v-else v-model="reactivePath[reactiveKey] as boolean" />
      </template>
      <template v-if="type === 'text' || type === 'number'">
        <div class="input-value">{{ reactivePath[reactiveKey] ?? value }}</div>
      </template>
    </div>
    <!-- <system-dialog v-model="editDialogOpened" @closed="closeEditDialog">
         <h1>hello</h1>
         </system-dialog> -->
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { MenuGroupProps } from './MenuGroup.vue';
import RoundedIcon from './RoundedIcon.vue';
import ToggleButton from './ToggleButton.vue';
import { onClickOutside } from '@vueuse/core';

// TODO: feat/settings rename file
export interface WithValue<TData = unknown> {
  value?: TData;
}

export interface WithReactivePath {
  reactivePath?: Record<string, unknown>;
  reactiveKey?: string;
}

interface MenuItemPropsBase<TData = unknown> {
  label: string;
  icon?: string;
  iconBackgroundColor?: string;
  value?: TData;
  selected?: boolean;
  type?: 'action' | 'toggle' | 'text' | 'number' | 'select' | 'multiple-select';
  color?: string;
  handler?: () => void;
  narrow?: boolean;
  disabled?: boolean;
  popupMenuGroup?: MenuGroupProps;
  actionIcon?: string;
  activeActionIcon?: string;
}

export type MenuItemProps<TData = unknown> = MenuItemPropsBase &
  WithValue<TData> &
  WithReactivePath;

const props = withDefaults(
  defineProps<
    {
      roundBorders: 'top' | 'bottom' | 'full' | 'none';
    } & MenuItemProps
  >(),
  {
    type: 'action',
    roundBorders: 'none',
  }
);

const isSelectable = computed(
  () =>
    props.type === 'select' &&
    props.reactivePath?.[props?.reactiveKey] === props.label
);

const handleClick = () => {
  selectValue() ?? editValue();
};

const selectValue = (): boolean => {
  if (props.type !== 'select') {
    return;
  }
  // eslint-disable-next-line vue/no-mutating-props
  props.reactivePath[props.reactiveKey] = props.label;
  return true;
};

const menuItemRef = ref<HTMLElement | null>(null);

onClickOutside(menuItemRef, () => {
  editMode.value = null;
});

const editInputRef = ref<HTMLInputElement | null>(null);
const editMode = ref<'text' | 'number'>(null);
const editValue = (): boolean => {
  if (!['text', 'number'].includes(props.type)) {
    return;
  }
  editMode.value = props.type as 'text' | 'number';
};

watch(
  () => editInputRef.value,
  (value) => {
    value?.focus();
  }
);
</script>

<style lang="scss" scoped>
.slot-actions {
  @include flexify(row, flex-start, center, var(--gap-sm));
  padding-right: var(--block-padding-md);
  display: none !important;
}

.item {
  @include flexify(row, space-between, center, var(--gap-md));
  cursor: pointer;
  height: var(--menu-item-height);
  padding: var(--block-padding-sm);

  &.full {
    border-radius: var(--block-border-radius-md);
  }

  &.top {
    border-top-left-radius: var(--block-border-radius-md);
    border-top-right-radius: var(--block-border-radius-md);
  }

  &.bottom {
    border-bottom-left-radius: var(--block-border-radius-md);
    border-bottom-right-radius: var(--block-border-radius-md);
  }

  &:hover {
    background-color: var(--base7);

    .slot-actions {
      display: flex !important;
    }
  }
}
.info {
  @include flexify(row, flex-start, center);

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.right-icons {
  @include flexify(row, flex-end, center);
}

.label {
  margin-left: var(--block-padding-md);
  font-weight: 500;
}

.narrow-icon {
  color: var(--fg-alt);
}

.selected-icon {
  color: var(--blue);
  padding-right: var(--block-padding-md);
}

.input-value {
  color: var(--fg-alt);
  padding-right: var(--block-padding-md);
}

input {
  flex: 1;
  text-align: right;
  margin-right: var(--block-padding-md);
  color: var(--fg);
  border: none;
  background: transparent;

  &:focus {
    outline: none;
  }

  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &[type='number'] {
    -moz-appearance: textfield;
  }
}
</style>
