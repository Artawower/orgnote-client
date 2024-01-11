<template>
  <div @touchstart.stop @mousedown.stop>
    <prevent-ios-touch>
      <div v-if="inited" class="editor-actions">
        <div
          v-for="cmd of editorCommands"
          @mousedown.prevent.stop="handleEditorAction(cmd)"
          :key="cmd.command"
          class="editor-action"
        >
          <q-icon :name="extractDynamicValue(cmd.icon)" size="sm" />
        </div>
      </div>
    </prevent-ios-touch>
  </div>
</template>

<script lang="ts" setup>
import { Command } from 'src/api';
import { useCommandsStore, useNoteEditorStore } from 'src/stores';
import { extractDynamicValue } from 'src/tools';

import { onMounted, ref } from 'vue';

import PreventIosTouch from 'src/components/ui/PreventIosTouch.vue';

const noteEditorStore = useNoteEditorStore();
const commandsStore = useCommandsStore();

const editorCommands = commandsStore.getCommandsFromGroup('editor');

const handleEditorAction = (action: Command) => {
  action.handler(noteEditorStore.editorView);
};

const inited = ref<boolean>(false);

onMounted(() => setTimeout(() => (inited.value = true), 100));
</script>

<style lang="scss">
.editor-actions {
  @include flexify(row, flex-start);
  background: var(--bg-alt);
  overflow-x: auto;
  gap: var(--gap-md);
  /* padding: var(--block-padding-md); */
  width: 100%;
  height: var(--footer-height);

  /* TODO: master doesn't work for ios
  need to get list of available devices
  and get their keyboards height
  after that we can calculate real viewport height
  based on focus status in the CM */
  position: absolute;
  bottom: 0;
  &:active {
    color: var(--base8);
  }

  .editor-action {
    cursor: pointer;
    color: var(--fg);
  }
}
</style>
