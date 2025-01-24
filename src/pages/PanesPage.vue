<template>
  <page-wrapper>
    <visibility-wrapper>
      <template #desktop-below>
        <h1>page</h1>
        <tabs-page />
      </template>
      <template #desktop-above>
        <splitpanes>
          <pane>
            <tabs-page />
          </pane>
          <pane>
            <tabs-page />
          </pane>
        </splitpanes>
      </template>
    </visibility-wrapper>
  </page-wrapper>
</template>

<script lang="ts" setup>
import PageWrapper from 'src/components/PageWrapper.vue';
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import TabsPage from './TabsPage.vue';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';
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
