<template>
  <div class="page">
    <slot name="navigation-header">
      <navigation-header />
    </slot>

    <div class="page-content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
</script>

<style lang="scss">
.page-content {
  @include flexify(column, center, flex-start, var(--gap-md));
  padding: var(--block-padding-md);
  width: 100%;
}
</style>
