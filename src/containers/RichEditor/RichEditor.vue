<template>
  <div
    class="editor-wrapper"
    :class="{
      readonly,
      'hide-special-symbols': !editorConfig.showSpecialSymbols,
      'show-property-drawer': editorConfig.showPropertyDrawer,
    }"
  >
    <div id="editor" ref="editorRef" class="rich-editor"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { api } from 'src/boot/api';
import { setCursorToEOF } from './use-cursor';
import { useEditorView } from './use-editor-view';
import { to } from 'orgnote-api';
import { reporter } from 'src/boot/report';

const props = defineProps<{
  readonly?: boolean;
}>();

const model = defineModel<string>();
const editorRef = ref<HTMLDivElement>();

const configStore = api.core.useConfig();
const editorConfig = computed(() => configStore.config.editor);

const { initView, destroyView, updateContent, setReadonly } = useEditorView({
  readonly: props.readonly,
  onContentUpdate: (content: string) => {
    model.value = content;
  },
});

const initEditor = () => {
  if (!editorRef.value) return;

  const view = initView(editorRef.value, model.value ?? '');
  setCursorToEOF(view);
};

const safeInitEditor = () => {
  const res = to(initEditor)();
  if (res.isErr()) {
    reporter.reportError('Failed to initialize rich text editor', res.error);
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
</script>

<style lang="scss">
@import './RichEditor.scss';
</style>
