<template>
  <app-flex
    class="icon"
    :style="iconStyle"
    :class="[{ rounded, bordered }, sizeClass, $attrs.class]"
    center
    align-center
  >
    <q-icon v-bind="$props" color="inherit" :size="iconSize" />
  </app-flex>
</template>

<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
});
import type { StyleSize, ThemeVariable } from 'orgnote-api';
import type { QIconProps } from 'quasar';
import { getCssVariableName } from 'src/utils/css-utils';
import { computed } from 'vue';
import AppFlex from 'src/components/AppFlex.vue';

interface Props {
  color?: ThemeVariable;
  background?: string;
  size?: StyleSize | (string & {});
  rounded?: boolean;
  bordered?: boolean;
}

const props = withDefaults(defineProps<QIconProps & Props>(), {
  size: 'md',
});

const bgColor = computed(() => props.background && getCssVariableName(props.background));
const color = computed(() => (props.color ? getCssVariableName(props.color) : undefined));

const iconSizeMap: { [key in StyleSize]?: string } = {
  xs: '1em',
  sm: '1.2em',
  md: '1.6em',
  lg: '3em',
};

const predefinedSizes = ['xs', 'sm', 'md', 'lg'];

const sizeClass = computed(() => {
  if (predefinedSizes.includes(props.size)) {
    return `icon-${props.size}`;
  }
  return '';
});

const iconSize = computed(() => {
  if (props.size in iconSizeMap) {
    return iconSizeMap[props.size as StyleSize];
  }
  return props.size;
});

const iconStyle = computed(() => {
  const style: Record<string, string> = {};
  if (bgColor.value) style.backgroundColor = bgColor.value;
  if (color.value) style.color = color.value;

  if (!predefinedSizes.includes(props.size) && props.size !== 'xl') {
    style.width = props.size;
    style.height = props.size;
    style.minWidth = props.size;
    style.minHeight = props.size;
  }

  return Object.keys(style).length > 0 ? style : undefined;
});
</script>

<style lang="scss">
.icon {
  $btn-sizes: (
    xs: var(--btn-action-xs-size),
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

.icon.rounded {
  border-radius: var(--icon-rounded-radius);
  padding: 2px;
  box-sizing: content-box;
}

.bordered {
  border: var(--icon-border);
  padding: var(--icon-border-padding);
  border-radius: var(--icon-radius);
}
</style>
