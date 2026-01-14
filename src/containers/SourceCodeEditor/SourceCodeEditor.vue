<template>
  <div class="source-code-editor" :class="{ readonly }">
    <div ref="editorRef" class="container"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { to } from 'orgnote-api';
import { reporter } from 'src/boot/report';
import { api } from 'src/boot/api';
import { useCodeEditorView } from './use-code-editor-view';

const props = defineProps<{
  readonly?: boolean;
  language?: string;
}>();

const model = defineModel<string>();
const editorRef = ref<HTMLDivElement>();
const themeStore = api.ui.useTheme();

const { initView, destroyView, updateContent, setReadonly, setLanguage, setTheme } = useCodeEditorView({
  readonly: props.readonly,
  language: props.language,
  isDark: themeStore.isDark,
  onContentUpdate: (content: string) => {
    model.value = content;
  },
});

const initEditor = () => {
  if (!editorRef.value) return;
  initView(editorRef.value, model.value ?? '');
};

const safeInitEditor = () => {
  const res = to(initEditor)();
  if (res.isErr()) {
    reporter.reportError('Failed to initialize source code editor', res.error);
  }
};

onMounted(safeInitEditor);
onUnmounted(destroyView);

watch(
  () => model.value,
  (newValue) => updateContent(newValue ?? ''),
);

watch(
  () => props.readonly,
  (value) => setReadonly(value ?? false),
);

watch(
  () => props.language,
  (value) => setLanguage(value),
);

watch(
  () => themeStore.isDark,
  (value) => setTheme(value),
);
</script>

<style lang="scss" scoped>
.source-code-editor {
  width: 100%;
  height: 100%;
  overflow: auto;

  .container {
    min-height: 100%;
  }

  :deep(.cm-editor) {
    height: 100%;
    font-family: var(--editor-font-family-code);
    font-size: var(--font-size-md);
    background: var(--bg);

    &.cm-focused {
      outline: none;
    }
  }

  :deep(.cm-scroller) {
    overflow: auto;
    padding: var(--padding-md);
  }

  :deep(.cm-content) {
    caret-color: var(--fg);
  }

  :deep(.cm-cursor) {
    border-left-color: var(--fg);
  }

  :deep(.cm-gutters) {
    background: var(--bg-alt);
    color: var(--fg-muted);
    border-right: 1px solid var(--border);
  }

  :deep(.cm-activeLineGutter) {
    background: var(--bg-hover);
  }

  :deep(.cm-activeLine) {
    background: var(--bg-hover);
  }

  :deep(.cm-selectionBackground) {
    background: var(--selection) !important;
  }

  :deep(.cm-line) {
    padding-left: var(--padding-sm);
  }

  :deep(.cm-foldGutter) {
    width: 1em;
  }

  &.readonly {
    :deep(.cm-content) {
      cursor: default;
    }
  }
}
</style>
