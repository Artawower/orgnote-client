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
import { OrgNode, parse, getDiff } from 'org-mode-ast';
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
    prettifyText(null, orgNode.value as OrgNode);
  }
);

const prettifyText = (insertPosition?: number, ...orgNodes: OrgNode[]) => {
  debouncePrettifyEditorText(
    hideSpecialSymbols.value,
    insertPosition,
    ...orgNodes
  );
};

const textChangeHandler: TextChangeHandler = (delta, _oldDelta, src) => {
  if (src === 'api') {
    return;
  }
  const newText = quill.getText();
  const diff = getDiff(newText, text.value);
  setText(newText);

  emits('update:modelValue', [text.value, orgNode.value as OrgNode]);

  const [pos, op] = delta.ops;

  const insertPosition = op?.insert ? pos?.retain : undefined;

  prettifyText(insertPosition, ...diff);
};

const initEditor = () => {
  quill = mountRawEditor();
  quillFormatter.initQuill(quill);
  quill.on('text-change', textChangeHandler);
  console.log('✎: [line 82][quill] text.value: ', text.value);
  quill.setText(text.value);
  quillFormatter.prettifyText(
    hideSpecialSymbols.value,
    null,
    orgNode.value as OrgNode
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
  font-family: var(--editor-font-family-main);
}

.ql-editor {
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
