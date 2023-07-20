<template>
  <div class="editor-wrapper">
    <div id="editor"></div>
  </div>
</template>

<script lang="ts" setup>
import Quill, { TextChangeHandler } from 'quill';
import 'highlight.js/styles/stackoverflow-light.css';
import { clearQuillFormat, debounce } from 'src/tools';
import { mountRawEditor } from './editor-initializer';
import { onMounted, ref, toRef, watch } from 'vue';
import { OrgNode, parse } from 'org-mode-ast';
import { useQuillFormatter } from 'src/hooks/quill-formatter';

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
const quillFormatter = useQuillFormatter();

const emits = defineEmits<{
  (e: 'update:modelValue', val: [string, OrgNode]): void;
}>();

const setText = (t: string) => {
  text.value = t;
  orgNode.value = parse(t);
};

const debouncePrettifyEditorText = debounce(quillFormatter.prettifyText, 100);

watch(
  () => hideSpecialSymbols.value,
  (newSpecialSymbolsHidden, oldSpecialSymbolsHidden) => {
    if (newSpecialSymbolsHidden !== oldSpecialSymbolsHidden) {
      clearQuillFormat(quill);
    }
    prettifyText();
  }
);

const prettifyText = (insertPosition?: number) => {
  debouncePrettifyEditorText(
    orgNode.value as OrgNode,
    hideSpecialSymbols.value,
    insertPosition
  );
};

const textChangeHandler: TextChangeHandler = (delta, oldDelta, src) => {
  if (src === 'api') {
    return;
  }
  setText(quill.getText());
  emits('update:modelValue', [text.value, orgNode.value as OrgNode]);

  const [pos, op] = delta.ops;

  const insertPosition = op?.insert ? pos?.retain : undefined;

  prettifyText(insertPosition);
};

const initEditor = () => {
  quill = mountRawEditor();
  quillFormatter.initQuill(quill);
  quill.on('text-change', textChangeHandler);
  quill.setText(text.value);
  quillFormatter.prettifyText(
    orgNode.value as OrgNode,
    hideSpecialSymbols.value
  );
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

.ql-syntax {
  overflow: auto;
}
</style>
