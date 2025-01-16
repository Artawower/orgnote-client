<template>
  <div
    class="icon"
    :style="{ backgroundColor: bgColor, color: color, '--icon-hover-color': hoverColor }"
    :class="[{ rounded }, size]"
  >
    <q-icon v-bind="$props" color="inherit" :size="iconSize" />
  </div>
</template>

<script lang="ts" setup>
import type { QIconProps } from 'quasar';
import { getCssVariableName } from 'src/utils/css-utils';
import { computed } from 'vue';

type IconSize = 'xs' | 'sm' | 'md' | 'lg';

interface Props {
  color?: string;
  hoverColor?: string;
  background?: string;
  size?: IconSize;
  rounded?: boolean;
}

const props = withDefaults(defineProps<QIconProps & Props>(), {
  size: 'md',
});

const bgColor = computed(() => props.background && getCssVariableName(props.background));
const color = computed(() => getCssVariableName(props.color ?? 'fg'));
const hoverColor = computed(() => getCssVariableName(props.hoverColor ?? 'fg'));
const size = computed(() => `icon-${props.size}`);

const iconSizeMap: { [key in IconSize]: string } = {
  xs: '1em',
  sm: '1.2em',
  md: '1.6em',
  lg: '3em',
};
const iconSize = computed(() => iconSizeMap[props.size]);
</script>

<style lang="scss">
.icon.rounded {
  @include flexify(flex-start, center, center);
  border-radius: var(--icon-rounded-border-radius);
  padding: 2px;
  box-sizing: content-box;

  $btn-sizes: (
    sm: var(--btn-action-sm-size),
    md: var(--btn-action-md-size),
    lg: var(--btn-action-lg-size),
  );

  @each $size, $value in $btn-sizes {
    &.icon-#{$size} {
      width: $value;
      height: $value;
      min-width: $value;
      min-height: $value;
    }
  }
}

.icon {
  &:hover {
    color: var(--icon-hover-color) !important;
  }
}
</style>
