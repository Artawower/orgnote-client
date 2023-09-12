<template>
  <template v-if="opened">
    <Teleport
      v-if="viewStore.completionPosition === 'bottom'"
      to="#mini-buffer"
    >
      <CompletionResult />
    </Teleport>
    <div v-else class="completion-container">
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
.completion-item {
  min-height: var(--completion-item-min-height);
  padding: var(--completion-item-padding);
  cursor: pointer;

  &:hover {
    background: var(--completion-item-hover-background);
    color: var(--completion-item-hover-color);
  }
}

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
  border: 2px solid var(--fg-alt);
  border-radius: var(--completion-border-radius);
  overflow: hidden;
  z-index: 8;
  margin-left: var(--sidebar-width);

  q-list {
    flex: 1;
    overflow: auto;
  }
}
</style>
