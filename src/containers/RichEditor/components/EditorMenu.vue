<template>
  <div class="cm-editor-actions">
    <div role="button" class="cm-editor-menu">
      <q-icon name="drag_indicator" size="sm" />
    </div>
    <div role="button" class="cm-editor-menu" @click="openEditorInsertDialog">
      <q-icon name="add_box" size="sm" />
    </div>
  </div>
  <div v-if="dialogOpened" class="editor-dialog">
    <SearchContainer
      :autofocus="true"
      :items="editorInsertItems"
      :handler-wrapper="onItemClicked"
      :resetable="true"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { EditorView } from '@codemirror/view';
import type { Command, CommandHandlerParams } from 'orgnote-api';
import SearchContainer from 'src/components/SearchContainer.vue';
import { api } from 'src/boot/api';

const props = defineProps<{
  editorView: EditorView;
}>();

const dialogOpened = ref(false);

const openEditorInsertDialog = () => {
  dialogOpened.value = true;
};

const commandsStore = api.core.useCommands();
const editorInsertItems: Command[] = commandsStore.commands.filter(
  (cmd) => cmd.group === 'editor'
);

const onItemClicked = (itemFn: (params: CommandHandlerParams) => void) => {
  return (params: CommandHandlerParams) =>
    itemFn({ editorView: props.editorView, ...params });
};
</script>

<style lang="scss">
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
