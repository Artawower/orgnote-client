<template>
  <div class="nav-tabs">
    <div class="content">
      <slot />
    </div>
    <slot name="actions" />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.nav-tabs {
  @include flexify(row, flex-start, center, var(--gap-xs));
  padding: var(--padding-md);
  width: 100%;
  max-width: 100%;

  .content {
    @include flexify(row, flex-start, center, var(--gap-xs));
    overflow-x: auto;
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
    background: var(--bg-alt2);
  }
}
</style>
