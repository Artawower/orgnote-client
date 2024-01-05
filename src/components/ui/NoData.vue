<template>
  <div class="no-data">
    <slot />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.no-data {
  font-style: italic;
  color: var(--fg-alt);
}
</style>
