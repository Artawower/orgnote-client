<template>
  <div class="editor-wrapper">
    <div id="editor"></div>
  </div>
</template>

<script lang="ts">
export default { name: 'OrgWYSWYGEditorComponent' };
</script>

<script lang="ts" setup>
// TODO: master move this component components
import Quill, { TextChangeHandler } from 'quill';
import hljs from 'highlight.js';
import 'highlight.js/styles/stackoverflow-light.css';

import { useNoteEditorStore } from 'src/stores/note-editor';
import {
  headingSize,
  InvisibleBlot,
  prettifyEditorText,
  textSize,
} from 'src/tools';
import { onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { OrgNode } from 'org-mode-ast';

const noteEditorStore = useNoteEditorStore();
const { noteOrgData, specialSymbolsHidden } = storeToRefs(noteEditorStore);

const allFontSizes = [...headingSize, ...textSize];

let quill: Quill;
Quill.register(InvisibleBlot);

const textChangeHandler: TextChangeHandler = (delta, oldDelta, src) => {
  if (src === 'api') {
    return;
  }
  const text = quill.getText();
  noteEditorStore.setNoteText(text);
};

const initEditor = () => {
  quill = new Quill('#editor', {
    theme: 'snow',
    formats: [
      'size',
      'bold',
      'color',
      'code',
      'code-block',
      'italic',
      'link',
      'strike',
      InvisibleBlot.blotName,
    ],
    modules: {
      toolbar: false,
      syntax: {
        highlight: (text: string) => hljs.highlightAuto(text).value,
      },
    },
  });
  const fontSizeStyle = Quill.import('attributors/style/size');
  fontSizeStyle.whitelist = allFontSizes;
  Quill.register(fontSizeStyle, true);
  quill.on('text-change', textChangeHandler);
  // quill.on('selection-change', (r) => emit('cursorPositionChanged', r.index));
  quill.setText(noteEditorStore.noteText);
  prettifyEditorText(
    quill,
    noteOrgData.value as OrgNode,
    specialSymbolsHidden.value
  );
  quill.focus();
};

watch(
  () => [noteOrgData.value, specialSymbolsHidden.value],
  () => {
    if (!quill) {
      return;
    }
    // TODO: master research problem of type casting. Why did ref<OrgNode> lost private methods?
    prettifyEditorText(
      quill,
      noteOrgData.value as OrgNode,
      specialSymbolsHidden.value
    );
  }
);

onMounted(() => {
  initEditor();
});
</script>

<style lang="scss">
.editor-wrapper {
  width: 100%;
  max-width: var(--content-max-width);
  margin: auto;
}

#editor {
  font-family: charter, Georgia, Cambria, 'Times New Roman', Times, serif;
}

.ql-editor {
  height: calc(100vh - 114px);

  &:focus {
    outline: none;
  }
}

/* TODO: master wtf */
.ql-clipboard {
  display: none;
}
</style>
