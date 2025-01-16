<template>
  <card-wrapper :type="type">
    <h5 v-if="slots.cardTitle" class="card-title text-bold" :style="{ color: bg }">
      <app-icon v-if="type !== 'plain'" size="sm" :name="icon" :color="background" />
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
import type { CardType } from 'src/models/card-type';
import { CARD_TYPE_TO_BACKGROUND } from 'src/constants/card-type-to-background';

const props = withDefaults(
  defineProps<{
    title?: string;
    bordered?: boolean;
    outline?: boolean;
    type?: CardType;
  }>(),
  {
    type: 'plain',
  },
);

const slots = useSlots();

const background = computed(() => {
  return CARD_TYPE_TO_BACKGROUND[props.type];
});

const typeIconMap: { [key in CardType]?: string } = {
  plain: 'sym_o_info',
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
}

h5 {
  @include flexify(row, flex-start, center, var(--gap-sm));
}
</style>
