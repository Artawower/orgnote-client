<template>
  <app-sidebar :mini="true" :opened="opened">
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
import AppSidebar from 'src/components/AppSidebar.vue';
import CommandActionButton from 'src/containers/CommandActionButton.vue';
import { useSidebarStore } from 'src/stores/sidebar';

const { commands, footerCommands, opened } = storeToRefs(useSidebarStore());
</script>

<style lang="scss" scoped>
.command-list {
  @include flexify(column, flex-start, flex-start, var(--gap-sm));
}
</style>
