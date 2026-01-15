<template>
  <div class="safe-area" :class="classes">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    top?: boolean;
    bottom?: boolean;
    absolute?: boolean;
  }>(),
  {
    top: false,
    bottom: false,
    absolute: false,
  },
);

const hasExplicitInsets = computed(() => props.top || props.bottom);

const classes = computed(() => ({
  top: !hasExplicitInsets.value || props.top,
  bottom: !hasExplicitInsets.value || props.bottom,
  absolute: props.absolute,
}));
</script>

<style lang="scss" scoped>
.safe-area {
  padding-left: var(--safe-area-left);
  padding-right: var(--safe-area-right);
  min-height: 0;
  box-sizing: border-box;

  &.top {
    padding-top: var(--safe-area-top);
  }

  &.bottom {
    padding-bottom: var(--safe-area-bottom);
  }

  &.absolute {
    position: absolute;
    width: 100%;
    padding-top: 0;
    padding-bottom: 0;

    &.top {
      top: var(--safe-area-top);
    }

    &.bottom {
      bottom: var(--safe-area-bottom);
    }
  }
}

:global(body.keyboard-opened) .safe-area.bottom {
  padding-bottom: 0;
}

:global(body.keyboard-opened) .safe-area.absolute.bottom {
  bottom: 0;
}
</style>
