<template>
  <q-footer class="mini-buffer">
    <div id="mini-buffer"></div>
  </q-footer>
</template>

<script lang="ts" setup></script>

<style lang="scss">
:root {
  --mini-buffer-background: #{$grey-11};
  --mini-buffer-font-color: #{$grey-9};
  --mini-buffer-border-top: 1px solid #{$grey-9};
}

.mini-buffer {
  background: var(--mini-buffer-background);
  color: var(--mini-buffer-font-color);
}

#mini-buffer {
  border-top: var(--mini-buffer-border-top);
}
</style>
