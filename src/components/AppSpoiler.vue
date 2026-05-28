<template>
  <component
    :is="variant === 'flat' ? 'div' : CardWrapper"
    class="spoiler"
    :class="`variant-${variant}`"
    v-bind="variant === 'flat' ? {} : { type: 'plain' }"
  >
    <app-flex class="spoiler-header" @click="toggle" row between align-center gap="md">
      <div class="spoiler-title">
        <slot name="title" />
      </div>
      <app-icon
        name="sym_o_expand_more"
        size="sm"
        color="fg-muted"
        :class="{ rotated: expanded }"
        class="spoiler-icon"
      />
    </app-flex>
    <slide-transition>
      <div v-if="expanded" class="spoiler-body" :class="{ 'no-padding': noPadding }">
        <slot name="body" />
      </div>
    </slide-transition>
  </component>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import CardWrapper from './CardWrapper.vue';
import AppIcon from './AppIcon.vue';
import AppFlex from 'src/components/AppFlex.vue';
import SlideTransition from './SlideTransition.vue';

type AppSpoilerVariant = 'card' | 'card-static' | 'flat';

const props = withDefaults(
  defineProps<{
    defaultExpanded?: boolean;
    variant?: AppSpoilerVariant;
    noPadding?: boolean;
  }>(),
  {
    defaultExpanded: false,
    variant: 'card',
  },
);

const model = defineModel<boolean | undefined>({
  type: null,
});

const localExpanded = ref(props.defaultExpanded ?? false);

const expanded = computed(() => model.value ?? localExpanded.value);

const variant = computed(() => props.variant);

watch(
  model,
  (newValue) => {
    if (newValue !== undefined) {
      localExpanded.value = newValue;
    }
  },
  { immediate: true },
);

const toggle = (): void => {
  const nextValue = !expanded.value;
  localExpanded.value = nextValue;
  model.value = nextValue;
};
</script>

<style scoped lang="scss">
.spoiler {
  transition: background-color 0.2s ease;

  &.variant-card {
    @include hover {
      background-color: var(--menu-item-hover-bg);
    }
  }
}

.spoiler-header {
  & {
    @include interactive-no-select;
    cursor: pointer;
    min-height: var(--menu-item-height);
    padding: var(--menu-item-padding);
  }
}

.spoiler-title {
  @include fontify(var(--font-size-base), var(--font-weight-medium), var(--fg));

  & {
    flex: 1;
  }
}

.spoiler-icon {
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.spoiler-icon.rotated {
  transform: rotate(180deg);
}

.spoiler-body {
  padding: var(--padding-md);
  transition: height 0.22s ease;
}

.spoiler.variant-flat .spoiler-body,
.spoiler-body.no-padding {
  padding: 0;
}
</style>
