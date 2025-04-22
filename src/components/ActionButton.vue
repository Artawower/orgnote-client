<template>
  <button
    @click="onButtonClick"
    :class="[`icon-${size}`, active, { outline, border, text: slots.text }]"
    :style="{
      '--action-border-color': getCssVariableName(activeColor),
      '--btn-action-hover-color': getCssVariableName(hoverColor),
    }"
  >
    <animation-wrapper>
      <app-icon :key="activeIcon" :name="activeIcon" :size="size" :color="activeColor" />
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
import type { ThemeVariable } from 'orgnote-api';
import type { ViewSize } from 'src/models/view-size';

const props = withDefaults(
  defineProps<{
    icon: string;
    active?: boolean;
    size?: ViewSize;
    color?: ThemeVariable;
    fireIcon?: string;
    fireColor?: ThemeVariable;
    outline?: boolean;
    hoverColor?: ThemeVariable;
    border?: boolean;
  }>(),
  {
    active: false,
    size: 'md',
    color: 'fg',
  },
);

const fired = ref<boolean>(false);

const activeIcon = computed(() => (fired.value ? props.fireIcon : props.icon));
const activeColor = computed(() => (fired.value ? (props.fireColor ?? props.color) : props.color));

const onButtonClick = () => {
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
  @include flexify(row, center, center, var(--gap-sm));

  & {
    padding: var(--btn-action-padding);
    border-radius: var(--btn-action-radius);
    color: var(--btn-action-color);
    cursor: pointer;
    border: var(--btn-action-border);
    box-sizing: border-box;
    background: transparent;
  }

  &.icon-xs {
    padding: var(--padding-xs);
    width: var(--btn-action-xs-size);
    height: var(--btn-action-xs-size);
    border-radius: var(--border-radius-xs);
  }

  &.icon-sm {
    padding: var(--padding-sm);
    border-radius: var(--border-radius-sm);
  }

  &.icon-md {
    padding: var(--padding-sm);
    border-radius: var(--border-radius-md);
  }

  &.icon-lg {
    padding: var(--padding-lg);
    border-radius: var(--border-radius-lg);
  }

  &.text {
    width: var(--btn-action-text-width);
    justify-content: flex-start;
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
    color: var(--btn-action-active-color);
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
