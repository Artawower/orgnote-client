<template>
  <button
    @click="onButtonClick"
    :class="[`icon-${size}`, active, { outline, border }]"
    :style="{ '--action-border-color': getCssVariableName(activeColor) }"
  >
    <animation-wrapper>
      <app-icon
        :hover-color="hoverColor"
        :key="activeIcon"
        :name="activeIcon"
        :size="size"
        :color="activeColor"
      />
    </animation-wrapper>
  </button>
</template>

<script lang="ts" setup>
import AppIcon from './AppIcon.vue';
import AnimationWrapper from './AnimationWrapper.vue';
import { computed, ref } from 'vue';
import { ICON_CHANGE_DURATION } from 'src/constants/animations';
import { getCssVariableName } from 'src/utils/css-utils';
import type { ThemeVariable } from 'orgnote-api';
import type { IconSize } from 'src/models/icon-size';

const props = withDefaults(
  defineProps<{
    icon: string;
    active?: boolean;
    size?: IconSize;
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
</script>

<style lang="scss" scoped>
button {
  @include flexify(row, center, center);
  padding: var(--btn-action-padding);
  border-radius: var(--btn-action-radius);
  color: var(--btn-action-color);
  cursor: pointer;
  border: var(--btn-action-border);
  box-sizing: border-box;
  background: transparent;

  &:not(.outline) {
    background: var(--btn-action-bg);
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
      color: color-mix(
        in srgb,
        var(--action-border-color, var(--border-default)),
        20% black
      ) !important;
    }
  }
}
</style>
