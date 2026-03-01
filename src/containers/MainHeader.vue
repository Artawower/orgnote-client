<template>
  <app-header float>
    <template v-if="canGoBack || canGoForward" #left>
      <action-button
        v-if="canGoBack"
        icon="keyboard_arrow_left"
        size="sm"
        color="fg-muted"
        @click="handleNavigation('back')"
      />
      <action-button
        v-if="canGoForward"
        icon="keyboard_arrow_right"
        size="sm"
        color="fg-muted"
        @click="handleNavigation('forward')"
      />
    </template>
    <template #center>
      <span class="header-title">{{ panes.activeTabTitle }}</span>
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
import { inject, shallowRef, type ShallowRef } from 'vue';
import type { Router } from 'vue-router';
import AppHeader from 'src/components/AppHeader.vue';
import ActionButton from 'src/components/ActionButton.vue';
import CommandActionButton from './CommandActionButton.vue';
import { api } from 'src/boot/api';
import { TAB_ROUTER_KEY } from 'src/constants/context-providers';
import { useTabHistory } from 'src/composables/use-tab-history';

const pinnedCommandsStore = api.ui.usePinnedCommands();
const rightCommands = pinnedCommandsStore.getCommands('right-header');

const panes = api.core.usePane();

const fallbackRouter = shallowRef<Router | undefined>(undefined);
const tabRouter = inject<ShallowRef<Router | undefined>>(TAB_ROUTER_KEY, fallbackRouter);
const { canGoBack, canGoForward, handleNavigation } = useTabHistory(tabRouter);
</script>

<style lang="scss" scoped>
.header-title {
  padding: 0 var(--padding-lg);
  user-select: none;
}
</style>
