<template>
  <div class="nav-tabs">
    <slot />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.nav-tabs {
  @include flexify(row, flex-start, center, var(--gap-sm));
  padding: var(--padding-md);
}
</style>
