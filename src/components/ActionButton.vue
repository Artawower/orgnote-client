<template>
  <button
    @click="onButtonClick"
    :class="[`icon-${size}`, active, { outline, border, text: slots.text }, props.classes]"
    :style="{
      '--action-border-color': getCssVariableName(activeColor),
      '--btn-action-hover-color': safeHoverColor,
      color: getCssVariableName(activeColor),
    }"
  >
    <animation-wrapper>
      <slot name="icon" :size="size" :color="activeColor">
        <app-icon :key="activeIcon" :name="activeIcon" :size="size" :color="activeColor" />
      </slot>
    </animation-wrapper>
    <slot name="text" />
  </button>
</template>

<script lang="ts" setup>
import AppIcon from './AppIcon.vue';
import AnimationWrapper from './AnimationWrapper.vue';
import { computed, ref, useSlots } from 'vue';
import { ICON_CHANGE_DURATION } from 'src/constants/animations';
import { getCssVariableName } from 'src/utils/css-utils';
// TODO: feat/stable-beta wrong place to logic
import { copyToClipboard } from 'src/utils/clipboard';
import type { StyleSize, ThemeVariable } from 'orgnote-api';

export type ButtonAlignment = 'center' | 'space-between' | 'left' | 'right';

const props = withDefaults(
  defineProps<{
    icon?: string;
    active?: boolean;
    size?: StyleSize;
    color?: ThemeVariable;
    fireIcon?: string;
    fireColor?: ThemeVariable;
    outline?: boolean;
    hoverColor?: ThemeVariable;
    border?: boolean;
    classes?: string;
    copyText?: string;
    alignment?: ButtonAlignment;
  }>(),
  {
    active: false,
    size: 'md',
    color: 'fg',
    classes: '',
    fireColor: 'red',
    alignment: 'center',
  },
);

const fired = ref<boolean>(false);

const activeIcon = computed(() => (fired.value ? props.fireIcon : props.icon));
const activeColor = computed(() => (fired.value ? (props.fireColor ?? props.color) : props.color));
const safeHoverColor = computed(() => props.hoverColor && getCssVariableName(props.hoverColor));

const onButtonClick = async () => {
  if (props.copyText) {
    await copyToClipboard(props.copyText);
  }

  if (!props.fireIcon) {
    return;
  }

  fired.value = true;

  setTimeout(() => {
    fired.value = false;
  }, ICON_CHANGE_DURATION);
};

const slots = useSlots();
</script>

<style lang="scss" scoped>
button {
  @include flexify(row, v-bind(alignment), center, var(--gap-sm));

  & {
    padding: var(--btn-action-padding);
    border-radius: var(--btn-action-radius);
    color: var(--btn-action-fg);
    cursor: pointer;
    border: var(--btn-action-border);
    box-sizing: border-box;
    background: transparent;
  }

  &.icon-xs {
    padding: var(--padding-xs);
    width: var(--btn-action-xs-size);
    height: var(--btn-action-xs-size);
    min-width: var(--btn-action-xs-size);
    min-height: var(--btn-action-xs-size);
    border-radius: var(--border-radius-xs);
  }

  &.icon-sm {
    padding: var(--padding-sm);
    width: var(--btn-action-sm-size);
    height: var(--btn-action-sm-size);
    min-width: var(--btn-action-sm-size);
    min-height: var(--btn-action-sm-size);
    border-radius: var(--border-radius-sm);
  }

  &.icon-md {
    padding: var(--padding-sm);
    width: var(--btn-action-md-size);
    height: var(--btn-action-md-size);
    min-width: var(--btn-action-md-size);
    min-height: var(--btn-action-md-size);
    border-radius: var(--border-radius-md);
  }

  &.icon-lg {
    padding: var(--padding-lg);
    width: var(--btn-action-lg-size);
    height: var(--btn-action-lg-size);
    min-width: var(--btn-action-lg-size);
    min-height: var(--btn-action-lg-size);
    border-radius: var(--border-radius-lg);
  }

  &.text {
    width: var(--btn-action-text-width);
  }

  &:not(.outline) {
    &:hover,
    &:active {
      background: var(--btn-action-hover-bg);
      filter: brightness(var(--btn-action-hover-brightness));
    }
  }

  &.active {
    background: var(--btn-action-active-bg);
    color: var(--btn-action-active-fg);
  }

  &.border {
    border: var(--border-default);
    border-color: var(--action-border-color, var(--border-default));
  }

  &:hover {
    border-color: color-mix(in srgb, var(--action-border-color, var(--border-default)), 20% black);

    .icon {
      color: var(
        --btn-action-hover-color,
        color-mix(in srgb, var(--action-border-color, var(--border-default)), 20% black)
      ) !important;
    }
  }
}
</style>
