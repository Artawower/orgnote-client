<template>
  <app-sidebar :mini="miniMode" :opened="opened">
    <template #mini-top>
      <app-flex class="command-list" column start align-start gap="sm">
        <command-action-button v-for="cmd of commands" :command="cmd" :key="cmd" />
      </app-flex>
    </template>
    <template #mini-footer>
      <app-flex class="command-list" column start align-start gap="sm">
        <command-action-button v-for="cmd of footerCommands" :command="cmd" :key="cmd" />
      </app-flex>
    </template>
    <app-flex column class="content-wrapper">
      <component
        :is="component"
        v-bind="componentConfig?.componentProps || {}"
        class="sidebar-content"
      ></component>
      <visibility-wrapper tablet-below>
        <safe-area bottom>
          <app-footer v-if="opened">
            <command-action-button v-for="cmd of footerCommands" :command="cmd" :key="cmd" />
          </app-footer>
        </safe-area>
      </visibility-wrapper>
    </app-flex>
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
import AppFlex from 'src/components/AppFlex.vue';
import SafeArea from 'src/components/SafeArea.vue';

const { commands, footerCommands, opened, component, componentConfig } = storeToRefs(
  api.ui.useSidebar(),
);
const screenDetector = useScreenDetection();
const miniMode = screenDetector.tabletAbove;
</script>

<style lang="scss" scoped>
.sidebar {
  position: relative;
}

.footer {
  flex-direction: row-reverse;
  left: 0;
  bottom: 0;
}

.content-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.sidebar-content {
  flex: 1;
}

/* TODO: plugin */
/* Plugin */
/* --sidebar-bg: var(--fg); */

/* ::v-deep(*) {
   color: var(--bg) !important;
   }

   ::v-deep() {
   .action-btn:hover {
   div {
   i {
   color: var(--fg) !important;
   }
   }
   }
   } */
</style>
