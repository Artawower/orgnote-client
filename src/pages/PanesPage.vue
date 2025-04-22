<template>
  <page-wrapper>
    <visibility-wrapper>
      <template #desktop-below>
        <app-pane v-if="activePaneId" :pane-id="activePaneId" />
      </template>
      <template #desktop-above>
        <splitpanes>
          <pane v-for="(_, i) of panes" :key="i">
            <app-pane :pane-id="`${i}`" />
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
import AppPane from './AppPane.vue';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import { onMounted } from 'vue';

const paneManager = api.core.usePane();
const { panes, activePaneId } = storeToRefs(paneManager);

const initInitialPane = async () => {
  if (activePaneId.value) {
    return;
  }
  await paneManager.initNewPane();
};

onMounted(initInitialPane);
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
