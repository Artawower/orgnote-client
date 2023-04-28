<template>
  <div class="note-view">
    <div id="editor" ref="editorRef" @input="changeData"></div>
    <work-in-progress></work-in-progress>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from 'vue';

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import InlineCode from '@editorjs/inline-code';
import NestedList from '@editorjs/nested-list';
import Underline from '@editorjs/underline';
import Strikethrough from '@sotaproject/strikethrough';
import Undo from 'editorjs-undo';
import WorkInProgress from 'src/components/ui/WorkInProgress.vue';

const props = defineProps<{
  modelValue: string;
}>();

const emits = defineEmits<{
  'update:modelValue': (value: string) => void;
}>();

const editorRef = ref<HTMLElement>(null);
let editor: EditorJS;

const changeData = async () => {
  if (!editor) {
    return;
  }
  const data = await editor.save();
};

onMounted(async () => {
  editor = new EditorJS({
    holder: editorRef.value,
    tools: {
      header: Header,
      inlineCode: InlineCode,
      underline: Underline,
      strikethrough: Strikethrough,
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
  new Undo({ editor });
});

// onUnmounted(() => {});
</script>

<style lang="scss">
#editor {
  font-family: charter, Georgia, Cambria, 'Times New Roman', Times, serif;
  height: calc(100vh - 88px);
}
</style>
