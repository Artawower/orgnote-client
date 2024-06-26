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
        pwa: $q.platform.is.ios && !$q.platform.is.nativeMobile,
      }"
    >
      <completion-result />
    </div>
  </template>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useViewStore } from 'src/stores/view';

import CompletionResult from './CompletionResult.vue';
import { useCompletionStore } from 'src/stores/completion';

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

  &.choice {
    @media (max-height: 600px) {
      height: calc(100% - 2 * var(--completion-float-top));
    }
    @media (min-height: 600px) {
      height: 50%;
    }
  }

  &.mobile {
    margin-left: 0;

    &:not(.choice) {
      height: var(--completion-input-height);
      top: calc(var(--viewport-height) - var(--completion-input-height));
    }

    &.choice {
      top: 0;
      margin: var(--completion-container-margin);
      transform: translate(calc(-50% - var(--completion-container-margin)));
      height: calc(
        var(--viewport-height) - var(--completion-container-margin) * 2
      );
    }
  }

  q-list {
    flex: 1;
    overflow: auto;
  }
}
</style>
