<template>
  <app-flex
    row
    center
    a-center
    gap="xs"
    v-if="shouldShow"
    class="editor-actions-toolbar"
    @touchstart.stop
    @mousedown.stop
  >
    <command-action-button v-for="cmd of editorCommands" :key="cmd" :command="cmd" size="md" />
  </app-flex>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { isPresent } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import CommandActionButton from './CommandActionButton.vue';
import { useScreenDetection } from 'src/composables/use-screen-detection';
import { useKeyboardState } from 'src/composables/use-viewport-behavior';
import AppFlex from 'src/components/AppFlex.vue';

const editorStore = api.core.useEditor();
const { keyboardOpened } = useKeyboardState();
const { tabletBelow } = useScreenDetection();

const isEditorActive = computed(() => isPresent(editorStore.activeContext));

const shouldShow = computed(
  () => tabletBelow.value && isEditorActive.value && keyboardOpened.value,
);

const editorCommands = api.ui.usePinnedCommands().getCommands('editor-actions');
</script>

<style lang="scss" scoped>
.editor-actions-toolbar {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  width: 100%;
  height: var(--footer-height);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 var(--padding-sm);
  box-sizing: border-box;
  scrollbar-width: none;
  z-index: 100;
  background: var(--bg-secondary);

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
