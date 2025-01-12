<template>
  <div class="icon" :style="{ backgroundColor: bgColor, color }" :class="[{ rounded }, size]">
    <q-icon v-bind="$props" :color="color ?? getCssVariableName('fg')" />
  </div>
</template>

<script lang="ts" setup>
import type { QIconProps } from 'quasar';
import { getCssVariableName } from 'src/utils/css-utils';
import { computed } from 'vue';

interface Props {
  color?: string;
  background?: string;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

const props = withDefaults(defineProps<QIconProps & Props>(), {
  size: 'md',
});

const bgColor = computed(() => props.background && getCssVariableName(props.background));
const color = computed(() => getCssVariableName(props.color ?? 'fg'));
const size = computed(() => `icon-${props.size}`);
</script>

<style lang="scss">
.icon.rounded {
  @include flexify(flex-start, center, center);
  border-radius: var(--icon-rounded-border-radius);
  padding: 2px;
  box-sizing: content-box;

  &.icon-sm {
    width: var(--btn-action-sm-size);
    height: var(--btn-action-sm-size);
  }

  &.icon-md {
    width: var(--btn-action-md-size);
    height: var(--btn-action-md-size);
  }

  &.icon-lg {
    width: var(--btn-action-lg-size);
    height: var(--btn-action-lg-size);
  }
}
</style>
