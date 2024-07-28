<template>
  <div
    @click="handleClick"
    v-bind:key="label"
    role="button"
    class="item"
    ref="menuItemRef"
    :class="[
      roundBorders,
      {
        large: type === 'textarea',
      },
    ]"
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
      <div
        v-if="$slots.label ?? label"
        class="label capitalize"
        :style="{ color: color }"
      >
        <slot name="label" :value="value" :data="data">
          {{ $t(label) }}
        </slot>
      </div>
    </div>
    <textarea
      v-if="type === 'textarea'"
      v-model="modelValue as string"
      ref="editInputRef"
      :placeholder="label ? $t(label) : null"
      name="edit mode"
    ></textarea>
    <input
      v-else-if="editMode"
      v-model="modelValue"
      :type="editMode"
      ref="editInputRef"
      name="edit mode"
    />
    <div v-else class="right-icons">
      <div v-if="$slots['right-actions']" class="slot-actions">
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
        <div class="input-value">{{ modelValue }}</div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { MenuGroupProps } from './MenuGroup.vue';
import RoundedIcon from './RoundedIcon.vue';
import ToggleButton from './ToggleButton.vue';
import { onClickOutside } from '@vueuse/core';

export interface WithValue<TData = unknown> {
  value?: TData;
}

export interface WithReactivePath {
  reactivePath?: Record<string, unknown>;
  reactiveKey?: string;
}

interface MenuItemPropsBase<TValue = unknown, TData = unknown> {
  label?: string;
  icon?: string;
  iconBackgroundColor?: string;
  value?: TValue;
  data?: TData;
  selected?: boolean;
  type?:
    | 'action'
    | 'toggle'
    | 'text'
    | 'number'
    | 'select'
    | 'multiple-select'
    | 'textarea';
  color?: string;
  handler?: () => void;
  narrow?: boolean;
  disabled?: boolean;
  popupMenuGroup?: MenuGroupProps;
  actionIcon?: string;
  activeActionIcon?: string;
  info?: string;
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
  if (['number', 'text'].includes(props.type)) {
    editMode.value = null;
  }
});

const editableTypes = ['text', 'number', 'textarea'];
type EditableType = (typeof editableTypes)[number];

const editInputRef = ref<HTMLInputElement | null>(null);
const editMode = ref<EditableType>(
  props.type === 'textarea' ? 'textarea' : null
);
const editValue = (): boolean => {
  if (!editableTypes.includes(props.type)) {
    return;
  }
  editMode.value = props.type as EditableType;
};

watch(
  () => editInputRef.value,
  (value) => {
    value?.focus();
  }
);

const modelValue = ref<unknown>(
  props.reactivePath?.[props.reactiveKey] || props.value
);

const isReactiveModel = computed(
  () => !!props.reactivePath && !!props.reactiveKey
);

watch(
  () => modelValue.value,
  (value) => {
    if (isReactiveModel.value) {
      props.reactivePath[props.reactiveKey] = value;
    }
  }
);

watch(
  () => [
    props.reactivePath,
    props.reactiveKey,
    props.reactivePath?.[props.reactiveKey],
  ],
  () => {
    if (!isReactiveModel.value) {
      return;
    }
    modelValue.value = props.reactivePath?.[props.reactiveKey];
  }
);
</script>

<style lang="scss" scoped>
.slot-actions {
  @include flexify(row, flex-start, center, var(--gap-sm));
  display: none !important;
}

.item {
  @include flexify(row, space-between, center, var(--gap-md));
  cursor: pointer;
  height: var(--menu-item-height);
  padding: var(--block-padding-sm);

  &.large {
    height: auto;
    max-height: var(--menu-item-max-height);
  }

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

input,
textarea {
  flex: 1;
  margin-right: var(--block-padding-md);
  color: var(--fg);
  border: none;
  background: transparent;

  @include reset-input();
}

input {
  text-align: right;
}

textarea {
  width: 100%;
  height: calc(var(--menu-item-max-height) - 2 * var(--block-padding-sm));
  max-height: calc(var(--menu-item-max-height) - 2 * var(--block-padding-sm));
  min-height: var(--menu-item-height);
}
</style>
