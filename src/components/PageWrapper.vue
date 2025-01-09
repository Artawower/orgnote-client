<template>
  <div class="page">
    <slot />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.page {
  @include fit();
  @include flexify(column, flex-start, flex-start);

  background: var(--bg);
  padding-bottom: var(--footer-height);
}
</style>
