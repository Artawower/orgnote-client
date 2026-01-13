<template>
  <template v-if="opened">
    <div v-if="tabletBelow" class="backdrop" @click="rightSidebar.close" />
    <app-flex
      :reverse="tabletBelow"
      class="right-sidebar"
      :class="{ mobile: tabletBelow }"
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
      <div class="right-sidebar-content">
        <component
          v-if="component"
          :is="component"
          v-bind="componentConfig?.componentProps || {}"
        />
      </div>
    </app-flex>
  </template>
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
const { opened, width, component, componentConfig } = storeToRefs(rightSidebar);
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
.backdrop {
  position: fixed;
  inset: 0;
  background-color: var(--backdrop-bg);
  z-index: 10;
}

.right-sidebar {
  position: relative;
  height: 100%;
  background: var(--sidebar-bg);
  border-left: var(--sidebar-border-right);
  overflow: hidden;

  &.mobile {
    position: fixed;
    top: 0;
    right: 0;
    width: 85vw;
    max-width: 400px;
    z-index: 11;
  }
}

.right-sidebar-content {
  width: 100%;
  flex: 1;
  overflow: auto;
}

.right-sidebar-actions {
  width: 100%;
  padding: var(--gap-sm);
  border-bottom: var(--border-default);
  flex-shrink: 0;
}
</style>
