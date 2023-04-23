<template>
  <div class="note-view">
    <div id="editor" ref="editorRef" @input="changeData"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import NestedList from '@editorjs/nested-list';

const editorRef = ref<HTMLElement>(null);
let editor: EditorJS;

const changeData = async () => {
  if (!editor) {
    return;
  }
  const data = await editor.save();
  console.log('✎: [line 21][OrgEditor.vue<2>] data: ', data);
};

onMounted(async () => {
  editor = new EditorJS({
    holder: editorRef.value,
    tools: {
      header: Header,
      list: {
        class: NestedList,
        inlineToolbar: true,
        config: {
          defaultStyle: 'unordered',
        },
      },
    },
  });
  await editor.isReady;
});
</script>

<style lang="scss">
#editor {
  font-family: charter, Georgia, Cambria, 'Times New Roman', Times, serif;
  height: calc(100vh - 88px);
}
</style>
