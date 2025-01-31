<template>
  <div
    class="menu-item"
    :class="[{ disabled }, type, `prefer-${prefer}`, `size-${size}`]"
    :style="{ '--menu-item-lines': lines, '--current-menu-item-height': itemHeight }"
  >
    <div class="header">
      <div class="left">
        <app-icon
          v-if="icon"
          :name="icon"
          :background="inverseIconColors ? background : color"
          :color="inverseIconColors ? color : background"
          :rounded="true"
        ></app-icon>
        <div class="content text-bold capitalize" :style="{ color: getCssVariableName(color) }">
          <slot />
        </div>
      </div>
      <div v-if="slots.right || narrow || selected" class="right">
        <slot name="right" />
        <app-icon v-if="narrow" name="sym_o_arrow_forward_ios" size="xs" color="fg-alt" />
        <app-icon v-else-if="selected" name="sym_o_check" color="accent" size="sm" />
      </div>
    </div>
    <div v-if="slots.content" class="content">
      <slot name="content" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ThemeVariable } from 'orgnote-api';
import AppIcon from 'src/components/AppIcon.vue';
import { CARD_TYPE_TO_BACKGROUND } from 'src/constants/card-type-to-background';
import type { ViewType } from 'src/models/card-type';
import type { ViewSize } from 'src/models/view-size';
import { getCssVariableName } from 'src/utils/css-utils';
import { useSlots } from 'vue';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    icon?: string;
    narrow?: boolean;
    disabled?: boolean;
    active?: boolean;
    type?: ViewType;
    size?: ViewSize;
    selected?: boolean;
    lines?: number;
    inverseIconColors?: boolean;
    prefer?: 'left' | 'right';
  }>(),
  {
    type: 'plain',
    lines: 1,
    prefer: 'left',
    size: 'auto',
  },
);

const typeColorMap: { [key in ViewType]?: ThemeVariable } = {
  ...CARD_TYPE_TO_BACKGROUND,
  plain: 'fg',
};

const slots = useSlots();
const color = computed<ThemeVariable>(() =>
  props.active ? 'accent' : typeColorMap[props.type] || 'fg',
);
const background = computed<ThemeVariable>(() => 'bg');

const itemHeightMap = {
  xs: 'var(--menu-item-height-xs)',
  sm: 'var(--menu-item-height-sm)',
  md: 'var(--menu-item-height-md)',
  lg: 'var(--menu-item-height-lg)',
  auto: 'auto',
};
const itemHeight = computed(() => itemHeightMap[props.size]);
</script>

<style lang="scss" scoped>
.menu-item {
  @include flexify(column, flex-start, center, var(--gap-md));
  cursor: pointer;
  min-height: calc(var(--current-menu-item-height) * var(--menu-item-lines, 1));
  height: auto;
  width: 100%;
  position: relative;
  padding: var(--padding-sm) calc(var(--padding-sm) * 2);

  &:not(.size-auto) {
    max-height: calc(var(--current-menu-item-height) * var(--menu-item-lines, 1));
  }

  &.size-auto {
    min-height: calc(var(--menu-item-height) * var(--menu-item-lines, 1));
    padding: var(--menu-item-padding);
  }

  &:hover,
  &:active {
    background-color: var(--menu-item-hover-bg);
  }
}

.header {
  @include flexify(row, space-between, center, var(--gap-md));
  width: 100%;
  flex: 1;
}

.left {
  @include flexify(row, flex-start, center, var(--gap-sm));
  white-space: nowrap;
}

.prefer-left {
  .left {
    width: 100%;
  }
}

.prefer-right {
  .right {
    width: 100%;
  }
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
