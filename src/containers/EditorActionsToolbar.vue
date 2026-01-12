<template>
  <app-flex v-if="shouldShow" row flex-end a-center gap="xs" class="editor-actions-toolbar">
    <app-flex class="editor-actions" row start a-center gap="xs" @touchstart.stop @mousedown.stop>
      <command-action-button v-for="cmd of editorCommands" :key="cmd" :command="cmd" size="md" />
    </app-flex>
    <command-action-button :command="DefaultCommands.EDITOR_HIDE_KEYBOARD" size="md" />
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
import { DefaultCommands } from 'orgnote-api';

const editorStore = api.core.useEditor();
const { keyboardOpened, keyboardHeight } = useKeyboardState();
const { tabletBelow } = useScreenDetection();

const isEditorActive = computed(() => isPresent(editorStore.activeContext));

const shouldShow = computed(
  () => tabletBelow.value && isEditorActive.value && keyboardOpened.value && keyboardHeight.value > 0,
);

const editorCommands = api.ui.usePinnedCommands().getCommands('editor-actions');
</script>

<style lang="scss" scoped>
$toolbar-height: 44px;

.editor-actions-toolbar {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  width: 100%;
  height: $toolbar-height;
  position: fixed;
  left: 0;
  right: 0;
  top: calc(var(--initial-viewport-height, 100vh) - var(--keyboard-height, 0px) - #{$toolbar-height});
  padding: 0 var(--padding-sm);
  box-sizing: border-box;
  scrollbar-width: none;
  z-index: 100;
  background: var(--bg-secondary);

  &::-webkit-scrollbar {
    display: none;
  }
}

.editor-actions {
  overflow-x: auto;
}
</style>
