<template>
  <div
    class="round-icon"
    :class="color ?? 'color-white colored'"
    :style="{ backgroundColor: backgroundColor }"
  >
    <q-icon
      v-bind="$props"
      :color="color ?? (backgroundColor ? 'white' : '')"
    />
  </div>
</template>

<script lang="ts" setup>
import { QIconProps } from 'quasar';

defineProps<QIconProps & { backgroundColor?: string }>();
</script>

<style lang="scss">
.round-icon {
  @include flexify(flex-start, center, center);
  border-radius: var(--block-border-radius-sm);
  width: 32px;
  height: 32px;

  &:not(.colored) {
    border: 1px solid var(--fg-alt);
  }
}
</style>
