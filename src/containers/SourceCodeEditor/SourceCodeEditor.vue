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

const { initView, destroyView, updateContent, setReadonly, setLanguage, setTheme } =
  useCodeEditorView({
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
@import '../../css/prose-editor';

.source-code-editor {
  width: 100%;
  height: 100%;
  overflow: auto;

  .container {
    min-height: 100%;
  }

  :deep(.cm-editor) {
    height: 100%;
    font-family: var(--code-font-family);
    font-size: var(--code-font-size);
    background: var(--bg);

    &.cm-focused {
      outline: none;
    }
  }

  :deep(.cm-scroller) {
    overflow: auto;
    padding: var(--padding-md);
    padding-bottom: var(--floating-padding-bottom);
    font-family: var(--code-font-family);

    @include tablet-below {
      padding-top: calc(var(--content-top-offset, 0px) + var(--padding-xl));
    }
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

  :deep(.cm-editor.markdown-view) {
    @include prose-editor-base;

    --paragraph-font-size: var(--font-size-md);
    background: var(--bg);

    .cm-line.markdown-heading-line {
      font-family: var(--headline-font-family);
      font-weight: var(--headline-font-weight);
      line-height: var(--editor-headline-line-height);
      padding-top: var(--padding-lg);
    }

    .cm-line.markdown-heading-1 {
      --paragraph-font-size: var(--headline-font-size-1);
      font-size: var(--paragraph-font-size);
    }

    .cm-line.markdown-heading-2 {
      --paragraph-font-size: var(--headline-font-size-2);
      font-size: var(--paragraph-font-size);
    }

    .cm-line.markdown-heading-3 {
      --paragraph-font-size: var(--headline-font-size-3);
      font-size: var(--paragraph-font-size);
    }

    .cm-line.markdown-heading-4 {
      --paragraph-font-size: var(--headline-font-size-4);
      font-size: var(--paragraph-font-size);
    }

    .cm-line.markdown-heading-5 {
      --paragraph-font-size: var(--headline-font-size-5);
      font-size: var(--paragraph-font-size);
    }

    .cm-line.markdown-heading-6 {
      --paragraph-font-size: var(--headline-font-size-6);
      font-size: var(--paragraph-font-size);
    }

    .markdown-link,
    .markdown-link span {
      color: var(--accent) !important;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  &.readonly {
    :deep(.cm-content) {
      cursor: default;
    }
  }
}
</style>
