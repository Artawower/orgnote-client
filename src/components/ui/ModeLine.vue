<template>
  <q-footer class="no-shadow modeline">
    <q-tabs inline-label indicator-color="red">
      <slot></slot>
    </q-tabs>
  </q-footer>
</template>

<script lang="ts" setup></script>

<style lang="scss">
.modeline {
  background: var(--modeline-background);
  color: var(--modeline-font-color);
}
</style>
