<template>
  <div class="editor-wrapper">
    <div id="editor"></div>
  </div>
</template>

<script lang="ts">
export default { name: 'OrgWYSWYGEditorComponent' };
</script>

<!-- WYSWYG editor adaptet to org mode format -->
<script lang="ts" setup>
import Quill, { TextChangeHandler } from 'quill';
import 'src/../node_modules/quill/dist/quill.core.css';
import { headingSize, prettifyEditorText, textSize } from 'src/tools';
import { OrgNode, parse } from 'org-mode-ast';

import hljs from 'highlight.js';
import 'highlight.js/styles/stackoverflow-light.css';

import { onMounted, ref } from 'vue';

const allFontSizes = [...headingSize, ...textSize];

let quill: Quill;

const emit = defineEmits<{
  (e: 'update:modelValue', arg1: OrgNode): void;
  (e: 'cursorPositionChanged', pos: number): void;
}>();
let timeout: ReturnType<typeof setTimeout>;

const typingDelay = 600;
const editorValueChanged = (newOrgNode: OrgNode) => {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    emit('update:modelValue', newOrgNode);
  }, typingDelay);
};

const props = defineProps<{
  modelValue: OrgNode;
}>();

const textChangeHandler: TextChangeHandler = (delta, oldDelta, src) => {
  emit('cursorPositionChanged', quill.getSelection()?.index || 0);
  if (src === 'api') {
    return;
  }
  const text = quill.getText();
  const parsed = parse(text);
  prettifyEditorText(quill, parsed);
  editorValueChanged(parsed);
};

const initEditor = () => {
  quill = new Quill('#editor', {
    theme: 'snow',
    formats: ['size', 'bold', 'color', 'code', 'code-block'],
    modules: {
      toolbar: false,
      syntax: {
        highlight: (text: string) => hljs.highlightAuto(text).value,
      },
    },
    // formats: [],
  });
  const fontSizeStyle = Quill.import('attributors/style/size');
  fontSizeStyle.whitelist = allFontSizes;
  Quill.register(fontSizeStyle, true);

  quill.on('text-change', textChangeHandler);
  quill.on('selection-change', (r) => emit('cursorPositionChanged', r.index));
  quill.setText(stringify(props.modelValue || ''));
};

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
</style>
