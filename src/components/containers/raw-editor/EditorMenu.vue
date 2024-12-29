<template>
  <div class="cm-editor-actions">
    <div role="button" class="cm-editor-menu">
      <q-icon name="drag_indicator" size="sm"> </q-icon>
    </div>
    <div @click="openEditorInsertDialog" role="button" class="cm-editor-menu">
      <q-icon name="add_box" size="sm"> </q-icon>
    </div>
  </div>
  <div v-if="dialogOpened" class="editor-dialog">
    <search-container
      :autofocus="true"
      :items="editorInsertItems"
      :handler-wrapper="onItemClicked"
      :resetable="true"
    />
  </div>
</template>

<script lang="ts" setup>
import { Command, CommandHandlerParams } from 'src/api';

import { ref } from 'vue';

import SearchContainer from 'src/components/ui/SearchContainer.vue';
import { useCommandsStore } from 'src/stores/commands';
import { EditorView } from '@codemirror/view';

const props = defineProps<{
  editorView: EditorView;
}>();

const dialogOpened = ref<boolean>();
const openEditorInsertDialog = () => {
  dialogOpened.value = true;
};

const commandsStore = useCommandsStore();
const editorInsertItems: Command[] =
  commandsStore.getCommandsFromGroup('editor');

const onItemClicked = (itemFn: (params: CommandHandlerParams) => void) => {
  return (params: CommandHandlerParams) =>
    itemFn({ editorView: props.editorView, ...params });
};
</script>

<style scoped lang="scss">
.cm-editor-menu {
  color: var(--fg-alt);
  cursor: pointer;

  &:hover {
    color: var(--base8);
  }
}
.cm-editor-actions {
  @include flexify();
}

.editor-dialog {
  width: 320px;
  height: 250px;
  max-height: 250px;
  background: var(--bg-alt);
  border-radius: 8px;
  border: 1px solid var(--fg-alt);
}
</style>
