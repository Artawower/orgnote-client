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
</style>
