<template>
  <card-wrapper
    @click="handleClick"
    v-bind:key="label"
    role="button"
    ref="menuItemRef"
    :round-borders="roundBorders"
    :size="type === 'textarea' ? 'large' : 'small'"
    :class="{
      disabled: toValue(disabled),
    }"
  >
    <div class="info">
      <rounded-icon
        v-if="icon"
        size="sm"
        :name="icon"
        :backgroundColor="iconBackgroundColor"
      />
      <div
        v-if="type !== 'input' && ($slots.label ?? label)"
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
      v-else-if="editMode || type === 'input'"
      v-model="modelValue"
      :class="{ 'text-right': type !== 'input' }"
      :type="editMode"
      :placeholder="type === 'input' ? $t(label) : null"
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
      <template v-if="type === 'toggle'">
        <template v-if="!reactivePath">
          <toggle-button
            :modelValue="value"
            @update:modelValue="(value as any) = $event"
          />
        </template>
        <toggle-button v-else v-model="reactivePath[reactiveKey] as boolean" />
      </template>
      <template v-if="showValue">
        <div class="input-value">{{ modelValue }}</div>
      </template>
      <action-btn
        v-if="actionBtn"
        v-bind="props.actionBtn"
        ref="actionBtnRef"
      />
    </div>
  </card-wrapper>
</template>

<script lang="ts" setup>
import { computed, ref, watch, onMounted, toValue } from 'vue';
import { MenuGroupProps } from './MenuGroup.vue';
import RoundedIcon from './RoundedIcon.vue';
import ToggleButton from './ToggleButton.vue';
import CardWrapper from './CardWrapper.vue';
import ActionBtn from './ActionBtn.vue';
import { onClickOutside } from '@vueuse/core';
import { CardWrapperProps } from './CardWrapper.vue';
import { ActionBtnProps } from './ActionBtn.vue';
import { RefLikeObject } from 'src/models/ref-like.model';

export interface WithValue<TData = unknown> {
  value?: TData;
}

export interface WithReactivePath<T = Record<string, unknown>> {
  reactivePath?: T;
  reactiveKey?: keyof T;
}

interface MenuItemPropsBase<TValue = unknown, TData = unknown> {
  label?: string;
  icon?: string;
  actionBtn?: ActionBtnProps;
  autofocus?: boolean;
  iconBackgroundColor?: string;
  value?: TValue;
  data?: TData;
  selected?: boolean;
  type?:
    | 'action'
    | 'toggle'
    | 'text'
    | 'input'
    | 'number'
    | 'select'
    | 'multiple-select'
    | 'textarea'
    | 'readonly';
  color?: string;
  handler?: () => void;
  narrow?: boolean;
  disabled?: RefLikeObject<boolean>;
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
      roundBorders: CardWrapperProps['roundBorders'];
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

const actionBtnRef = ref<typeof ActionBtn | null>();

const handleClick = () => {
  selectValue() ?? editValue();
  if (props.actionBtn) {
    actionBtnRef.value?.showFired();
  }
};

const selectValue = (): boolean => {
  if (props.type !== 'select' || !isReactiveModel.value) {
    return;
  }
  // eslint-disable-next-line vue/no-mutating-props
  props.reactivePath[props.reactiveKey] = props.label;
  return true;
};

const menuItemRef = ref<HTMLElement | null>(null);

const editableTypes = ['text', 'number', 'textarea'];
type EditableType = (typeof editableTypes)[number];

const editInputRef = ref<HTMLInputElement | null>(null);
const editMode = ref<EditableType>(
  props.type === 'textarea' ? 'textarea' : null
);

onClickOutside(menuItemRef, () => {
  if (['number', 'text'].includes(props.type)) {
    editMode.value = null;
  }
});

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

const showValue = computed(() =>
  ['number', 'text', 'readonly'].includes(props.type)
);

const isReactiveModel = computed(
  () => !!props.reactivePath && !!props.reactiveKey
);

watch(
  () => modelValue.value,
  (value) => {
    if (isReactiveModel.value) {
      // eslint-disable-next-line vue/no-mutating-props
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

onMounted(() => {
  if (props.autofocus) {
    editInputRef.value?.focus();
  }
});
</script>

<style lang="scss" scoped>
.slot-actions {
  @include flexify(row, flex-start, center, var(--gap-sm));
  display: none !important;
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
  overflow: hidden;
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

  direction: rtl;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
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
  &.text-right {
    text-align: right;
  }
}

textarea {
  width: 100%;
  height: calc(var(--menu-item-max-height) - 2 * var(--block-padding-sm));
  max-height: calc(var(--menu-item-max-height) - 2 * var(--block-padding-sm));
  min-height: var(--menu-item-height);
}
</style>
