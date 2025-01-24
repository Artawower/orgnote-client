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
    <platform-specific :mobile="true">
      <app-footer v-if="opened">
        <command-action-button v-for="cmd of footerCommands" :command="cmd" :key="cmd" />
      </app-footer>
    </platform-specific>
  </app-sidebar>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import AppFooter from 'src/components/AppFooter.vue';
import AppSidebar from 'src/components/AppSidebar.vue';
import PlatformSpecific from 'src/components/PlatformSpecific.vue';
import { useScreenDetection } from 'src/composables/use-screen-detection';
import CommandActionButton from 'src/containers/CommandActionButton.vue';

const { commands, footerCommands, opened } = storeToRefs(api.ui.useSidebar());
const screenDetector = useScreenDetection();
const miniMode = screenDetector.desktopAbove;
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
