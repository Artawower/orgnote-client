<template>
  <card-wrapper :classes="type">
    <h5 v-if="slots.cardTitle" class="card-title text-bold" :style="{ color: bg }">
      <app-icon v-if="type !== 'simple'" size="sm" :name="icon" :color="background" />
      <slot name="cardTitle" />
    </h5>
    <div class="card-content">
      <slot />
    </div>
  </card-wrapper>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import { getCssVariableName } from 'src/utils/css-utils';
import { useSlots } from 'vue';
import { computed } from 'vue';
import AppIcon from './AppIcon.vue';

type CardType = 'simple' | 'info' | 'warning' | 'danger';

const props = withDefaults(
  defineProps<{
    title?: string;
    bordered?: boolean;
    outline?: boolean;
    type?: CardType;
  }>(),
  {
    type: 'simple',
  },
);

const typeBgMap: { [key in CardType]: string } = {
  simple: 'bg',
  info: 'blue',
  warning: 'yellow',
  danger: 'red',
};

const slots = useSlots();

const background = computed(() => {
  return typeBgMap[props.type];
});

const typeIconMap: { [key in CardType]: string } = {
  simple: 'sym_o_info',
  info: 'sym_o_info',
  warning: 'sym_o_warning',
  danger: 'sym_o_dangerous',
};

const icon = computed(() => {
  return typeIconMap[props.type];
});

const bg = computed(() => getCssVariableName(background.value));
</script>

<style lang="scss" scoped>
.card-wrapper {
  @include flexify(column, flex-start, flex-start, var(--gap-md));
  box-sizing: border-box;

  padding: var(--block-padding-md);

  $type-colors: (
    simple: var(--bg),
    info: var(--blue),
    warning: var(--yellow),
    danger: var(--red),
  );

  @each $type, $color in $type-colors {
    &.#{$type} {
      background: color-mix(in srgb, $color, var(--bg) 80%) !important;
      border-color: $color;

      ::v-deep(li::marker) {
        color: color-mix(in srgb, $color, var(--bg) 40%) !important;
      }
    }
  }
}

h5 {
  @include flexify(row, flex-start, center, var(--gap-sm));
}
</style>
