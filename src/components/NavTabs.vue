<template>
  <app-flex class="nav-tabs" between>
    <app-flex row start align-center gap="xs">
      <slot name="navigation" />
      <app-flex class="content" row start align-center gap="xs">
        <slot />
      </app-flex>
      <slot name="actions" />
    </app-flex>
    <slot name="right-actions" />
  </app-flex>
</template>

<script lang="ts" setup>
import AppFlex from 'src/components/AppFlex.vue';
</script>

<style lang="scss" scoped>
.nav-tabs {
  & {
    padding: var(--padding-md);
    width: 100%;
    background: var(--nav-tabs-bg);
    max-width: 100%;
    overflow-x: hidden;
  }

  :deep(.flex-container) {
    min-width: 0;
  }

  .content {
    & {
      overflow-x: auto;
      min-width: 0;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}

::v-deep(.tab:not(:last-child)) {
  &::after {
    content: '';
    position: absolute;
    right: -2px;
    display: block;
    width: 1px;
    z-index: 10;
    height: 66%;
    background: var(--bg-elevated);
  }
}
</style>
