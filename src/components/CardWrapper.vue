<template>
  <div
    class="card-wrapper"
    :class="[{ padding, border }, classes]"
    :style="{ 'background-color': bg }"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { getCssVariableName } from 'src/utils/css-utils';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    padding?: boolean;
    border?: boolean;
    background?: string;
    classes?: string;
  }>(),
  {
    padding: false,
    border: false,
    background: 'var(--bg)',
  },
);

const bg = computed(() => getCssVariableName(props.background ?? 'bg-alt'));
</script>

<style lang="scss">
.card-wrapper {
  border-radius: var(--card-border-radius);
  overflow: hidden;
  width: 100%;

  &.padding {
    padding: var(--card-padding);
  }

  &.border {
    border: var(--card-border);
  }
}
</style>
