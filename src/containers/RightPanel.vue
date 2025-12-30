<template>
  <app-flex v-if="opened" class="right-panel" column :style="{ width: `${width}px` }">
    <resize-splitter
      absolute
      :active="resize.isResizing.value"
      @resize-start="resize.handleResizeStart"
    />
    <app-flex class="right-panel-actions" end align-center gap="sm">
      <command-action-button v-for="cmd of commands" :command="cmd" :key="cmd" size="sm" />
    </app-flex>
    <div class="right-panel-content">
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
import { RIGHT_PANEL_MIN_WIDTH, RIGHT_PANEL_MAX_WIDTH } from 'src/constants/right-panel';

const rightPanel = api.ui.useRightPanel();
const { opened, width, commands, component, componentConfig } = storeToRefs(rightPanel);

const resize = useValueResize('horizontal', width, {
  min: RIGHT_PANEL_MIN_WIDTH,
  max: RIGHT_PANEL_MAX_WIDTH,
  reverse: true,
  unit: 'pixel',
});
</script>

<style lang="scss" scoped>
.right-panel {
  position: relative;
  height: 100%;
  background: var(--sidebar-bg);
  border-left: var(--sidebar-border-right);
  overflow: hidden;
}

.right-panel-content {
  width: 100%;
  flex: 1;
  overflow: auto;
}

.right-panel-actions {
  width: 100%;
  padding: var(--gap-sm);
  border-bottom: var(--border-default);
  flex-shrink: 0;
}
</style>
