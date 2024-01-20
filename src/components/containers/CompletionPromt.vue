<template>
  <template v-if="opened">
    <teleport
      v-if="viewStore.completionPosition === 'bottom'"
      to="#mini-buffer"
    >
      <completion-result />
    </teleport>
    <div
      v-else
      class="completion-container"
      :class="{
        mobile: $q.screen.lt.sm,
        choice: completionStore.completionMode === 'choice',
      }"
    >
      <completion-result />
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
  max-height: 50%;
  height: auto;
  top: var(--completion-float-top);
  left: 50%;
  transform: translate(-50%);
  background: var(--bg-alt);
  border: var(--completion-border);
  border-radius: var(--completion-border-radius);
  box-shadow: var(--completion-box-shadow);
  overflow: hidden;
  z-index: 7000;
  margin-left: calc(var(--sidebar-width) / 2);

  &.mobile {
    top: 0;
    margin-left: 0;
    height: calc(
      var(--viewport-height) - var(--completion-container-margin) * 2
    );
    transform: translate(calc(-50% - var(--completion-container-margin)));
    margin: var(--completion-container-margin);
  }

  q-list {
    flex: 1;
    overflow: auto;
  }

  &.choice {
    height: 50%;
  }
}
</style>
