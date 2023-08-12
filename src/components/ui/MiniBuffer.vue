<template>
  <q-footer class="mini-buffer">
    <div id="mini-buffer"></div>
  </q-footer>
</template>

<script lang="ts" setup></script>

<style lang="scss">
.mini-buffer {
  --mini-buffer-background: var(--bg-alt);
  --mini-buffer-font-color: var(--fg);
  --mini-buffer-border-top: 1px solid var(--base4);
}

.mini-buffer {
  background: var(--mini-buffer-background) !important;
  color: var(--mini-buffer-font-color);
}

#mini-buffer {
  border-top: var(--mini-buffer-border-top);
}
</style>
