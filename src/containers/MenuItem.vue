<template>
  <div class="menu-item" :class="{ active, disabled }" :style="{ '--menu-item-lines': lines }">
    <div class="left">
      <app-icon
        v-if="icon"
        :name="icon"
        :background="active ? 'accent' : 'fg'"
        color="bg"
        :rounded="true"
      ></app-icon>
      <div class="content" :style="{ color }">
        <slot />
      </div>
    </div>
    <div v-if="slots.right || narrow || selected" class="right">
      <slot name="right" />
      <app-icon v-if="narrow" name="sym_o_arrow_forward_ios" size="xs" color="fg-alt" />
      <app-icon v-else-if="selected" name="sym_o_check" color="accent" size="sm" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppIcon from 'src/components/AppIcon.vue';
import { getCssVariableName } from 'src/utils/css-utils';
import { useSlots } from 'vue';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    icon?: string;
    narrow?: boolean;
    active?: boolean;
    disabled?: boolean;
    color?: string;
    selected?: boolean;
    lines?: number;
  }>(),
  {
    lines: 1,
  },
);

const color = computed(() => getCssVariableName(props.active ? 'accent' : (props.color ?? 'fg')));
const slots = useSlots();
</script>

<style lang="scss" scoped>
.menu-item {
  @include flexify(row, space-between, center);
  cursor: pointer;
  padding: var(--menu-item-padding);
  min-height: calc(var(--menu-item-height) * var(--menu-item-lines, 1));
  /* max-height: calc(var(--menu-item-height) * var(--menu-item-lines, 1)); */
  height: auto;
  width: 100%;

  &:hover,
  &:active {
    background-color: var(--menu-item-hover-bg);
  }
}

.left {
  @include flexify(row, flex-start, center, var(--gap-sm));
  width: 100%;
}

.content {
  padding-left: var(--menu-item-padding);
  width: 100%;
}

.left,
.right,
.content {
  height: 100%;
}

.active {
  color: var(--accent);
}
</style>
