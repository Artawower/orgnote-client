<template>
  <app-sidebar :mini="miniMode" :opened="opened">
    <div class="command-list">
      <command-action-button v-for="cmd of commands" :command="cmd" :key="cmd" />
    </div>
    <template #footer>
      <div class="command-list">
        <command-action-button v-for="cmd of footerCommands" :command="cmd" :key="cmd" />
      </div>
    </template>
  </app-sidebar>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import AppSidebar from 'src/components/AppSidebar.vue';
import CommandActionButton from 'src/containers/CommandActionButton.vue';

const { commands, footerCommands, opened } = storeToRefs(api.ui.useSidebar());
const miniMode = api.core.useQuasar().platform.is.desktop;
</script>

<style lang="scss" scoped>
.command-list {
  @include flexify(column, flex-start, flex-start, var(--gap-sm));
}
</style>
