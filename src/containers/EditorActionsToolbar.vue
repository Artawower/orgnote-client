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
import { DefaultCommands } from 'orgnote-api';
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

const editorCommands = [
  DefaultCommands.EDITOR_HIDE_KEYBOARD,
  DefaultCommands.EDITOR_UNDO,
  DefaultCommands.EDITOR_REDO,
  DefaultCommands.EDITOR_INSERT_HEADLINE,
  DefaultCommands.EDITOR_INSERT_BOLD,
  DefaultCommands.EDITOR_INSERT_ITALIC,
  DefaultCommands.EDITOR_INSERT_STRIKETHROUGH,
  DefaultCommands.EDITOR_INSERT_INLINE_CODE,
  DefaultCommands.EDITOR_INSERT_LINK,
  DefaultCommands.EDITOR_INSERT_INTERNAL_LINK,
  DefaultCommands.EDITOR_INSERT_IMAGE,
  DefaultCommands.EDITOR_INSERT_CODE_BLOCK,
  DefaultCommands.EDITOR_INSERT_QUOTE,
  DefaultCommands.EDITOR_INSERT_LATEX,
  DefaultCommands.EDITOR_INSERT_BULLET_LIST,
  DefaultCommands.EDITOR_INSERT_NUMERIC_LIST,
  DefaultCommands.EDITOR_INSERT_CHECK_LIST,
  DefaultCommands.EDITOR_INSERT_CHECKBOX,
  DefaultCommands.EDITOR_INSERT_TABLE,
  DefaultCommands.EDITOR_INSERT_HORIZONTAL_RULE,
  DefaultCommands.EDITOR_INSERT_TAG,
  DefaultCommands.EDITOR_INSERT_DATETIME,
  DefaultCommands.EDITOR_INSERT_HTML_BLOCK,
];
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
