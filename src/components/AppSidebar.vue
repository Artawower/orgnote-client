<template>
  <safe-area>
    <div class="sidebar" :class="{ opened }">
      <div v-if="mini" class="mini">
        <div class="top">
          <slot name="mini-top" />
        </div>
        <div class="footer">
          <slot name="mini-footer" />
        </div>
      </div>
      <div class="content">
        <slot />
      </div>
    </div>
  </safe-area>
</template>

<script lang="ts" setup>
import SafeArea from './SafeArea.vue';

withDefaults(
  defineProps<{
    mini?: boolean;
    position?: 'left' | 'right';
    opened?: boolean;
  }>(),
  {
    mini: false,
    position: 'left',
    opened: true,
  },
);
</script>

<style lang="scss" scoped>
.sidebar {
  @include flexify();

  & {
    border-right: var(--sidebar-border-right);
    background: var(--sidebar-background);
    position: relative;
    height: 100vh;
    height: 100mvh;
  }

  .mini {
    @include flexify(column, space-between, center);

    & {
      width: var(--sidebar-mini-width);
      height: 100vh;
      height: 100mvh;
      padding: var(--sidebar-padding);
    }
  }

  &.opened {
    .content {
      & {
        padding: var(--sidebar-padding);
        flex: 1;
        width: calc(var(--sidebar-width) - var(--sidebar-mini-width));
      }
    }
  }

  .content {
    & {
      height: 100%;
      width: 0;
      overflow: hidden;
    }
  }
}
</style>
