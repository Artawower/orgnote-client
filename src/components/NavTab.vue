<template>
  <div class="tab">
    <div class="label">
      <app-icon v-if="icon" :name="icon" size="xs" color="fg-alt" />
      <slot />
    </div>
    <action-button icon="close" size="xs" color="fg-alt" />
  </div>
</template>

<script lang="ts" setup>
import ActionButton from './ActionButton.vue';
import AppIcon from './AppIcon.vue';

withDefaults(
  defineProps<{
    closble?: boolean;
    icon?: string;
  }>(),
  {
    closble: true,
  },
);
</script>

<style lang="scss" scoped>
.tab {
  @include flexify(row, space-between, center, var(--gap-sm));
  padding: var(--tab-padding);
  background: var(--tab-background);
  border-radius: var(--tab-border-radius);
  color: var(--tab-color);
  border: var(--tab-border);
  width: var(--tab-width);
  cursor: pointer;
}

.label {
  @include flexify(row, flex-start, center, var(--gap-sm));
}
</style>
