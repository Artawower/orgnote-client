<template>
  <div class="editor-wrapper">
    <div id="editor"></div>
  </div>
</template>

<script lang="ts" setup>
import Quill, { TextChangeHandler } from 'quill';
import 'highlight.js/styles/stackoverflow-light.css';
import { clearQuillFormat, prettifyEditorText } from 'src/tools';
import { mountRawEditor } from './editor-initializer';
import { onMounted, ref, toRef, watch } from 'vue';
import { OrgNode, parse } from 'org-mode-ast';

let quill: Quill;

const props = withDefaults(
  defineProps<{
    modelValue: [string, OrgNode?];
    hideSpecialSymbols?: boolean;
  }>(),
  { modelValue: () => [''] }
);

const text = toRef(props.modelValue, 0);
const orgNode = ref(parse(text.value ?? ''));
const hideSpecialSymbols = toRef(props, 'hideSpecialSymbols');

const emits = defineEmits<{
  (e: 'update:modelValue', val: [string, OrgNode]): void;
}>();

const setText = (t: string) => {
  text.value = t;
  orgNode.value = parse(t);
};

watch(
  () => hideSpecialSymbols.value,
  (newSpecialSymbolsHidden, oldSpecialSymbolsHidden) => {
    if (newSpecialSymbolsHidden !== oldSpecialSymbolsHidden) {
      clearQuillFormat(quill);
    }
    prettifyText();
  }
);

const prettifyText = () => {
  // TODO: master research problem of type casting. Why did ref<OrgNode> lost private methods?
  prettifyEditorText(quill, orgNode.value as OrgNode, hideSpecialSymbols.value);
};

const textChangeHandler: TextChangeHandler = (delta, oldDelta, src) => {
  if (src === 'api') {
    return;
  }
  setText(quill.getText());
  emits('update:modelValue', [text.value, orgNode.value as OrgNode]);
};

const initEditor = () => {
  quill = mountRawEditor();
  quill.on('text-change', textChangeHandler);
  // quill.on('selection-change', (r) => emit('cursorPositionChanged', r.index));
  quill.setText(text.value);
  prettifyEditorText(quill, orgNode.value as OrgNode, hideSpecialSymbols.value);
  quill.focus();
  quill.setSelection(quill.getLength(), 0);
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

.ql-editor {
  height: calc(100vh - 114px);

  &:focus {
    outline: none;
  }

  p {
    margin: 0;
  }
}

.ql-clipboard {
  display: none;
}
</style>
