<template>
  <card-wrapper class="spoiler" type="plain" :style="{ '--spoiler-max-height': maxHeight }">
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
    <animation-wrapper animation-name="expand">
      <div v-if="expanded" class="spoiler-body">
        <slot name="body" />
      </div>
    </animation-wrapper>
  </card-wrapper>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import CardWrapper from './CardWrapper.vue';
import AppIcon from './AppIcon.vue';
import AnimationWrapper from './AnimationWrapper.vue';
import AppFlex from 'src/components/AppFlex.vue';

const props = withDefaults(
  defineProps<{
    defaultExpanded?: boolean;
    maxHeight?: string;
  }>(),
  {
    defaultExpanded: false,
    maxHeight: '100px',
  },
);

const model = defineModel<boolean | undefined>({
  type: null,
});

const localExpanded = ref(props.defaultExpanded ?? false);

const expanded = computed(() => model.value ?? localExpanded.value);

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

  @include hover {
    background-color: var(--menu-item-hover-bg);
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
  max-height: var(--spoiler-max-height);
  overflow: auto;
}
</style>
