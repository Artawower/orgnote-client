<template>
  <app-flex
    :reverse="tabletBelow"
    class="right-sidebar-content-wrapper"
    column
    :style="sidebarStyle"
  >
    <resize-splitter
      v-if="!tabletBelow"
      absolute
      :active="resize.isResizing.value"
      @resize-start="resize.handleResizeStart"
    />
    <app-flex class="right-sidebar-actions" end align-center gap="sm">
      <command-action-button
        v-for="cmd of commands"
        :command="cmd"
        :key="cmd"
        :size="tabletBelow ? 'md' : 'sm'"
      />
    </app-flex>
    <div class="right-sidebar-body">
      <component v-if="component" :is="component" v-bind="componentConfig?.componentProps || {}" />
    </div>
  </app-flex>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import ResizeSplitter from 'src/components/ResizeSplitter.vue';
import CommandActionButton from 'src/containers/CommandActionButton.vue';
import AppFlex from 'src/components/AppFlex.vue';
import { useValueResize } from 'src/composables/use-value-resize';
import { RIGHT_SIDEBAR_MIN_WIDTH, RIGHT_SIDEBAR_MAX_WIDTH } from 'src/constants/right-sidebar';
import { useScreenDetection } from 'src/composables/use-screen-detection';
import { computed } from 'vue';

const rightSidebar = api.ui.useRightSidebar();
const { width, component, componentConfig } = storeToRefs(rightSidebar);
const commands = api.ui.usePinnedCommands().getCommands('right-sidebar');
const { tabletBelow } = useScreenDetection();

const sidebarStyle = computed(() => (tabletBelow.value ? {} : { width: `${width.value}px` }));

const resize = useValueResize('horizontal', width, {
  min: RIGHT_SIDEBAR_MIN_WIDTH,
  max: RIGHT_SIDEBAR_MAX_WIDTH,
  reverse: true,
  unit: 'pixel',
});
</script>

<style lang="scss" scoped>
.right-sidebar-content-wrapper {
  position: relative;
  height: 100%;
  background: var(--sidebar-bg);
  border-left: var(--sidebar-border-right);
  overflow: hidden;
  padding-bottom: var(--safe-area-bottom);
  padding-top: var(--safe-area-top);
}

.right-sidebar-body {
  width: 100%;
  flex: 1;
  overflow: auto;
}

.right-sidebar-actions {
  width: 100%;
  padding: var(--padding-md) var(--padding-lg);
  border-bottom: var(--border-default);
  flex-shrink: 0;
}
</style>
