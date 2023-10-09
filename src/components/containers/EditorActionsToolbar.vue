<template>
  <div class="editor-actions">
    <div
      v-for="cmd of editorCommands"
      @mousedown="handleEditorAction(cmd)"
      :key="cmd.command"
      class="editor-action"
    >
      <q-icon :name="cmd.icon" size="sm" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Command } from 'src/models';
import { useCommandsStore, useNoteEditorStore } from 'src/stores';

const noteEditorStore = useNoteEditorStore();
const commandsStore = useCommandsStore();

const editorCommands = commandsStore.getCommandsFromGroup('editor');

const handleEditorAction = (action: Command) => {
  action.handler(noteEditorStore.editorView);
};
</script>

<style lang="scss">
.editor-actions {
  @include flexify(row, flex-start);
  background: var(--bg-alt);
  overflow-x: auto;
  gap: var(--default-gap);
  padding: var(--default-block-padding);
  width: 100%;

  /* TODO: master doesn't work for ios
  need to get list of available devices
  and get their keyboards height
  after that we can calculate real viewport height
  based on focus status in the CM */
  position: absolute;
  bottom: 0;
  &:active {
    color: var(--cyan);
  }

  .editor-action {
    cursor: pointer;
    color: var(--fg);
  }
}
</style>
