<template>
  <app-sidebar :mini="miniMode" :opened="opened">
    <template #mini-top>
      <div class="command-list">
        <command-action-button v-for="cmd of commands" :command="cmd" :key="cmd" />
      </div>
    </template>
    <template #mini-footer>
      <div class="command-list">
        <command-action-button v-for="cmd of footerCommands" :command="cmd" :key="cmd" />
      </div>
    </template>
    <visibility-wrapper tablet-below>
      <app-footer v-if="opened">
        <command-action-button v-for="cmd of footerCommands" :command="cmd" :key="cmd" />
      </app-footer>
    </visibility-wrapper>
    <component :is="component" v-bind="componentConfig?.componentProps || {}"></component>
  </app-sidebar>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import AppFooter from 'src/components/AppFooter.vue';
import AppSidebar from 'src/components/AppSidebar.vue';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';
import { useScreenDetection } from 'src/composables/use-screen-detection';
import CommandActionButton from 'src/containers/CommandActionButton.vue';

const { commands, footerCommands, opened, component, componentConfig } = storeToRefs(
  api.ui.useSidebar(),
);
const screenDetector = useScreenDetection();
const miniMode = screenDetector.tabletAbove;
</script>

<style lang="scss" scoped>
.command-list {
  @include flexify(column, flex-start, flex-start, var(--gap-sm));
}

.sidebar {
  position: relative;
}

.footer {
  flex-direction: row-reverse;
  left: 0;
  bottom: 0;
}
</style>
