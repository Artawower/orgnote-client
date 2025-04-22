<template>
  <div class="tab" :class="{ active }">
    <div class="label">
      <app-icon v-if="icon" :name="icon" size="xs" color="fg-alt" />
      <slot />
    </div>
    <action-button @click.prevent.stop="emits('close')" icon="close" size="xs" color="fg-alt" />
  </div>
</template>

<script lang="ts" setup>
import ActionButton from './ActionButton.vue';
import AppIcon from './AppIcon.vue';

withDefaults(
  defineProps<{
    closable?: boolean;
    icon?: string;
    active?: boolean;
  }>(),
  {
    closable: true,
  },
);

const emits = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<style lang="scss" scoped>
.tab {
  @include flexify(row, space-between, center, var(--gap-sm));

  & {
    padding: var(--tab-padding);
    background: var(--tab-background);
    border-radius: var(--tab-border-radius);
    color: var(--tab-color);
    border: var(--tab-border);
    width: var(--tab-width);
    cursor: pointer;
    height: var(--tab-height);
    box-sizing: border-box;
    position: relative;
  }

  &:not(.active):hover {
    background: var(--tab-active-hover-background);
  }
}

.tab.active {
  border: var(--tab-active-border);
  color: var(--tab-active-color);
  background: var(--tab-active-background);
}

.label {
  @include flexify(row, flex-start, center, var(--gap-sm));
}
</style>
