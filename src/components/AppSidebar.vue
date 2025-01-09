<template>
  <div class="sidebar">
    <div v-if="mini" class="mini">
      <div class="top">
        <slot />
      </div>
      <div class="footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
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
  border-right: var(--sidebar-border-right);
  background: var(--sidebar-background);
  padding: var(--sidebar-padding);
  width: var(--sidebar-width);
  height: 100vh;
  height: 100mvh;

  .mini {
    width: var(--sidebar-mini-width);
    height: 100vh;
    height: 100mvh;
  }
}
</style>
