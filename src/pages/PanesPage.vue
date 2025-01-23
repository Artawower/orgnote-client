<template>
  <page-wrapper>
    <splitpanes>
      <pane>1</pane>
      <pane>2</pane>
    </splitpanes>
  </page-wrapper>
</template>

<script lang="ts" setup>
import PageWrapper from 'src/components/PageWrapper.vue';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
</script>

<style lang="scss" scoped>
.panes-page {
  @include fit();
}

::v-deep(.splitpanes--vertical > .splitpanes__splitter) {
  min-width: var(--splitter-size);
  background: var(--splitter-background);
}

::v-deep(.splitpanes--horizontal > .splitpanes__splitter) {
  min-height: var(--splitter-size);
  background: var(--splitter-background);
}
</style>
