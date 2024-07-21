<template>
  <div v-bind:key="label" role="button" class="item" :class="roundBorders">
    <div
      class="info"
      :class="{
        disabled: disabled,
      }"
    >
      <rounded-icon
        v-if="icon"
        size="sm"
        :name="icon"
        :backgroundColor="iconBackgroundColor"
      />
      <div class="label capitalize" :style="{ color: color }">{{ label }}</div>
    </div>
    <div class="right-icons">
      <div class="slot-actions">
        <slot name="right-actions" />
      </div>
      <q-icon
        class="narrow-icon"
        v-if="!disableNarrow"
        name="sym_o_arrow_forward_ios"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { MenuItem } from './MenuGroup.vue';
import RoundedIcon from './RoundedIcon.vue';

withDefaults(
  defineProps<
    {
      roundBorders: 'top' | 'bottom' | 'full' | 'none';
    } & MenuItem
  >(),
  {
    roundBorders: 'none',
  }
);
</script>

<style lang="scss" scoped>
.slot-actions {
  @include flexify(row, flex-start, center, var(--gap-sm));
  padding-right: var(--block-padding-md);
  display: none !important;
}

.item {
  @include flexify(row, space-between, center);
  cursor: pointer;
  height: var(--menu-item-height);
  padding: var(--block-padding-sm);

  &.full {
    border-radius: var(--block-border-radius-md);
  }

  &.top {
    border-top-left-radius: var(--block-border-radius-md);
    border-top-right-radius: var(--block-border-radius-md);
  }

  &.bottom {
    border-bottom-left-radius: var(--block-border-radius-md);
    border-bottom-right-radius: var(--block-border-radius-md);
  }

  &:active,
  &:hover {
    background-color: var(--base7);

    .slot-actions {
      display: flex !important;
    }
  }
}
.info {
  @include flexify(row, flex-start, center);

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
.label {
  margin-left: var(--block-padding-md);
  font-weight: 500;
}

.narrow-icon {
  color: var(--fg-alt);
}
</style>
