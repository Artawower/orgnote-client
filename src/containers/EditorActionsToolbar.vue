<template>
  <app-flex
    v-if="shouldShow"
    row
    flex-end
    a-center
    gap="md"
    class="editor-actions-toolbar"
    @mousedown.prevent
  >
    <app-flex class="editor-actions" row start a-center gap="xs">
      <command-action-button
        v-for="cmd of editorCommands"
        :key="cmd"
        :command="cmd"
        size="md"
        :hover-effect="false"
      />
    </app-flex>
    <div class="fixed-editor-actions">
      <command-action-button
        :hover-effect="false"
        :command="DefaultCommands.EDITOR_HIDE_KEYBOARD"
        size="md"
      />
    </div>
  </app-flex>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { api } from 'src/boot/api';
import CommandActionButton from './CommandActionButton.vue';
import AppFlex from 'src/components/AppFlex.vue';
import { DefaultCommands } from 'orgnote-api';

const editorStore = api.core.useEditor();
const { keyboardOpened, keyboardHeight } = api.ui.useKeyboardState();
const { tabletBelow } = api.ui.useScreenDetection();

const isEditorFocused = computed(() => editorStore.activeContext?.focused === true);

const shouldShow = computed(
  () =>
    tabletBelow.value && isEditorFocused.value && keyboardOpened.value && keyboardHeight.value > 0,
);

const editorCommands = api.ui.usePinnedCommands().getCommands('editor-actions');
</script>

<style lang="scss" scoped>
$toolbar-height: calc(52px + var(--footer-wrapper-padding-y, 0px));

.editor-actions-toolbar {
  @include hide-scrollbar;

  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  width: 100%;
  height: $toolbar-height;
  position: fixed;
  left: 0;
  right: 0;
  top: calc(
    var(--initial-viewport-height, 100vh) - var(--keyboard-height, 0px) - #{$toolbar-height}
  );
  padding: var(--footer-wrapper-padding-x) calc(var(--footer-wrapper-padding-x) / 2);

  box-sizing: border-box;
  z-index: 100;
}

.editor-actions {
  overflow-x: auto;
  padding: 0 var(--padding-md);
  @include hide-scrollbar;
}

.editor-actions,
.fixed-editor-actions {
  border-radius: var(--footer-border-radius);
  background: var(--bg-secondary);
}
</style>
