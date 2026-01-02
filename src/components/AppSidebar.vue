<template>
  <safe-area>
    <app-flex class="sidebar" :class="{ opened, 'has-mini': mini }" row between align-center>
      <app-flex v-if="mini" class="mini" column between align-center>
        <div class="top">
          <slot name="mini-top" />
        </div>
        <div class="footer">
          <slot name="mini-footer" />
        </div>
      </app-flex>
      <div class="content">
        <slot />
      </div>
    </app-flex>
  </safe-area>
</template>

<script lang="ts" setup>
import SafeArea from './SafeArea.vue';
import AppFlex from 'src/components/AppFlex.vue';

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
  --btn-action-hover-bg: var(--sidebar-hover-bg);
  --bg-hover: var(--sidebar-hover-bg);
  --menu-item-hover-bg: var(--sidebar-hover-bg);
  --placeholder-fg: var(--sidebar-fg-muted);

  & {
    border-right: var(--sidebar-border-right);
    background: var(--sidebar-bg);
    position: relative;
    height: 100dvh;
    height: calc(var(--full-height) - var(--device-padding-top, 0px) - env(safe-area-inset-top));

    * {
      color: var(--sidebar-fg);
    }
  }

  .mini {
    & {
      width: var(--sidebar-mini-width);
      height: 100vh;
      height: 100dvh;
      height: var(--full-height);
      padding: var(--sidebar-padding);
    }
  }

  &.opened {
    .content {
      & {
        padding: var(--sidebar-padding);
        flex: 1;
        width: var(--sidebar-width);
      }
    }
  }

  &.opened.has-mini {
    .content {
      & {
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
