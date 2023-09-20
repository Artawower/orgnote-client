<template>
  <div class="header-bar row justify-between items-center q-pa-sm no-wrap">
    <div class="left-bar">
      <slot name="header" />
    </div>
    <div class="actions row no-wrap">
      <slot name="actions" />
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss">
.header-bar {
  width: 100%;
  height: var(--headerbar-height);
  background-color: var(--bg-alt);
  border-radius: var(--headerbar-border-radius);
  background-color: var(--headerbar-background-color);
  color: var(--headerbar-color);
  border: var(--headerbar-border);
}

.left-bar {
  flex: 1;
}
</style>
