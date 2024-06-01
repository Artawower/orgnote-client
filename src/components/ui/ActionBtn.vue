<template>
  <button
    v-if="contentSlotPassed"
    @click="clicked"
    :disabled="loading"
    class="action-btn text-btn"
    :class="[
      { fired, dark: $q.dark.isActive },
      contentClass ?? '',
      `size-${size}`,
      theme ? `theme-${theme}` : '',
    ]"
  >
    <q-icon
      :class="{ loading }"
      v-if="currentIcon"
      :name="currentIcon"
      size="1rem"
    />
    <slot />
  </button>
  <q-icon
    v-else
    @click="clicked"
    :disabled="loading"
    :name="currentIcon"
    size="1rem"
    class="action-btn"
    :class="[
      { loading, fired, dark: $q.dark.isActive },
      contentClass ?? '',
      `size-${size}`,
    ]"
  />
</template>

<script lang="ts" setup>
import { Ref, computed, ref, toRefs, useSlots } from 'vue';

const emits = defineEmits<{
  (e: 'click'): void;
}>();

const props = withDefaults(
  defineProps<{
    icon?: string;
    activeIcon?: string;
    contentClass?: string;
    loading?: boolean;
    theme?:
      | 'red'
      | 'orange'
      | 'green'
      | 'teal'
      | 'yellow'
      | 'blue'
      | 'dark-blue'
      | 'magenta'
      | 'violet'
      | 'cyan'
      | 'dark-cyan'
      | 'white';
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    size: 'md',
  }
);

const { icon, activeIcon, loading } = toRefs(props);

const currentIcon = computed(() => {
  if (loading.value) {
    return 'sync';
  }
  if (activeIcon.value && fired.value) {
    return activeIcon.value;
  }
  return icon.value;
});

const fired: Ref<boolean> = ref(false);

const showFired = () => {
  fired.value = true;
  setTimeout(() => {
    fired.value = false;
  }, 1000);
};

const slots = useSlots();
const contentSlotPassed = computed(() => !!slots.default);

const clicked = () => {
  showFired();
  emits('click');
};
</script>

<style lang="scss">
.action-btn {
  width: var(--btn-action-md);
  height: var(--btn-action-md);
  color: var(--btn-action-color);
  box-shadow: var(--btn-action-shadow);
  border: var(--btn-action-border);
  border-color: var(--btn-action-border-color);
  border-radius: var(--btn-action-radius);
  padding: var(--btn-action-padding);
  background: var(--btn-action-bg);

  cursor: pointer;

  &.dark {
    color: --base0;
  }

  &.fired {
    color: var(--btn-action-fire-color);
    border-color: var(--btn-action-fire-border-color);

    .q-icon {
      color: var(--btn-action-fire-color);
    }
  }

  .size-lg {
    width: var(--btn-action-md);
    height: var(--btn-action-md);
  }
}

.text-btn {
  @include flexify();

  gap: var(--gap-sm);
  width: auto;
  height: calc(var(--btn-action-md) + var(--btn-action-padding) * 2);
  font-size: var(--font-size-md);

  &.size-lg {
    height: calc(var(--btn-action-lg) + var(--btn-action-padding) * 2);
    padding-left: calc(var(--btn-action-padding) * 2);
    padding-right: calc(var(--btn-action-padding) * 2);
  }

  &.size-sm {
    font-size: var(--font-size-sm);
    height: calc(var(--btn-action-sm) + var(--btn-action-padding) * 2);
  }
}

$colors: 'red', 'orange', 'green', 'teal', 'yellow', 'blue', 'dark-blue',
  'magenta', 'violet', 'cyan', 'dark-cyan', 'white';

@each $color in $colors {
  .theme-#{$color} {
    color: var(--#{$color});
    border-color: var(--#{$color});
    background: transparent;

    .q-icon {
      color: var(--#{$color});
    }

    &:hover {
      color: color-mix(in srgb, var(--#{$color}) 70%, var(--white));
      border-color: color-mix(in srgb, var(--#{$color}) 70%, var(--white));

      .q-icon {
        color: color-mix(in srgb, var(--#{$color}) 70%, var(--white));
      }
    }
  }
}

.q-icon.loading {
  animation: spin 1s infinite linear;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(-359deg);
  }
}

button,
.q-icon {
  &[disabled='false'] {
    cursor: pointer !important;
  }
}
</style>
