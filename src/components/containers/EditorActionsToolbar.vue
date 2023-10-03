<template>
  <div class="editor-actions">
    <div
      v-for="action of editorActionsStore.actions"
      @mousedown="handleEditorAction(action)"
      :key="action.name"
      class="editor-action"
    >
      <q-icon :name="action.icon" size="sm" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useEditorActionsStore, useNoteEditorStore } from 'src/stores';

import { SearchItem } from '../ui/SearchContainer.vue';

const editorActionsStore = useEditorActionsStore();
const noteEditorStore = useNoteEditorStore();

const handleEditorAction = (action: SearchItem) => {
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
