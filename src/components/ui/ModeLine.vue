<template>
  <q-footer class="no-shadow modeline">
    <q-tabs v-if="tabMode" inline-label indicator-color="red">
      <slot></slot>
    </q-tabs>
    <div v-else class="footer-content q-px-lg">
      <slot name="left"></slot>
      <slot name="middle"></slot>
      <slot name="right"></slot>
    </div>
  </q-footer>
</template>

<script lang="ts" setup>
import { toRef } from 'vue';

const props = withDefaults(
  defineProps<{
    tabMode?: boolean;
  }>(),
  {
    tabMode: true,
  }
);

const tabMode = toRef(props, 'tabMode');
</script>

<style lang="scss">
:root {
  --modeline-height: 48px;
  --modeline-padding: 0 32px;
  --modeline-background: #{$light};
}
.modeline {
  background: var(--modeline-background);
  color: var(--modeline-font-color);
}

.footer-content {
  @include flexify(row, flex-start);

  height: var(--modeline-height);
  max-width: var(--content-max-width);
  margin: auto;
}
</style>
