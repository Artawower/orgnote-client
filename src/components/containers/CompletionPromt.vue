<template>
  <template v-if="opened">
    <Teleport
      v-if="viewStore.completionPosition === 'bottom'"
      to="#mini-buffer"
    >
      <CompletionResult />
    </Teleport>
    <div
      v-else
      class="completion-container"
      :class="{ mobile: $q.screen.lt.sm }"
    >
      <CompletionResult />
    </div>
  </template>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useCompletionStore } from 'src/stores';
import { useViewStore } from 'src/stores/view';

import CompletionResult from './CompletionResult.vue';

const completionStore = useCompletionStore();

const { opened } = storeToRefs(completionStore);
const viewStore = useViewStore();
</script>

<style lang="scss">
.completion-container {
  @include flexify(column, flex-start, flex-start);
  position: fixed;
  width: var(--completion-width);
  max-width: var(--completion-max-width);
  height: 50%;
  top: var(--completion-float-top);
  left: 50%;
  transform: translate(-50%);
  background: var(--bg-alt);
  border: var(--completion-border);
  border-radius: var(--completion-border-radius);
  box-shadow: var(--completion-box-shadow);
  overflow: hidden;
  z-index: 1000;
  margin-left: calc(var(--sidebar-width) / 2);

  &.mobile {
    margin-left: 0;
    width: 96%;
  }

  q-list {
    flex: 1;
    overflow: auto;
  }
}
</style>
