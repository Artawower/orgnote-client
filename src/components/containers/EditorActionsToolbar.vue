<template>
  <div
    v-if="inited"
    class="editor-actions"
    @touchmove="touchMove"
    @touchstart="touchStart"
  >
    <div
      v-for="cmd of editorCommands"
      @mousedown.prevent.stop="handleEditorAction(cmd)"
      :key="cmd.command"
      class="editor-action"
    >
      <q-icon :name="cmd.icon" size="sm" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { Command } from 'src/models';
import { useCommandsStore, useNoteEditorStore } from 'src/stores';

import { onMounted, ref } from 'vue';

const noteEditorStore = useNoteEditorStore();
const commandsStore = useCommandsStore();

const editorCommands = commandsStore.getCommandsFromGroup('editor');

const handleEditorAction = (action: Command) => {
  action.handler(noteEditorStore.editorView);
};

const $q = useQuasar();
let startY = 0;
let startX = 0;
const touchStart = (e: TouchEvent) => {
  startY = e.touches[0].clientY;
  startX = e.touches[0].clientX;
};
const touchMove = (e: TouchEvent) => {
  const isVertical = Math.abs(e.changedTouches[0].clientY - startY) > 15;
  const isHorizontal = Math.abs(e.changedTouches[0].clientX - startX) > 5;
  if (
    (isVertical || !isHorizontal) &&
    $q.platform.is.ios &&
    !$q.platform.is.cordova
  ) {
    e.preventDefault();
    return;
  }
};

const inited = ref<boolean>(false);

onMounted(() => setTimeout(() => (inited.value = true), 100));
</script>

<style lang="scss">
.editor-actions {
  @include flexify(row, flex-start);
  background: var(--bg-alt);
  overflow-x: auto;
  gap: var(--default-gap);
  /* padding: var(--default-block-padding); */
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
    color: var(--cyan);
  }

  .editor-action {
    cursor: pointer;
    color: var(--fg);
  }
}
</style>
