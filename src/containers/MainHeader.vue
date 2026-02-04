<template>
  <app-header>
    <template #center>
      <span class="header-title">{{ panes.activeTab?.title }}</span>
    </template>
    <template #right>
      <command-action-button
        v-for="c of rightCommands"
        v-bind:key="c"
        :command="c"
        size="md"
        :hover-effect="false"
      />
    </template>
  </app-header>
</template>

<script lang="ts" setup>
import AppHeader from 'src/components/AppHeader.vue';
import CommandActionButton from './CommandActionButton.vue';
import { api } from 'src/boot/api';

const pinnedCommandsStore = api.ui.usePinnedCommands();
const rightCommands = pinnedCommandsStore.getCommands('right-header');

const panes = api.core.usePane();
</script>

<style lang="scss" scoped>
.header-title {
  padding: 0 var(--padding-lg);
}
</style>
