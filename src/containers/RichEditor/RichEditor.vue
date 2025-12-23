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

const props = defineProps<{
  readonly?: boolean;
}>();

const model = defineModel<string>();
const editorRef = ref<HTMLDivElement>();

const configStore = api.core.useConfig();
const editorConfig = computed(() => configStore.config.editor);

let isInternalUpdate = false;

const handleContentUpdate = (content: string) => {
  isInternalUpdate = true;
  model.value = content;
  isInternalUpdate = false;
};

const {
  initView,
  destroyView,
  updateContent,
  setReadonly,
} = useEditorView({
  readonly: props.readonly,
  onContentUpdate: handleContentUpdate,
});

const initEditor = () => {
  if (!editorRef.value) return;

  const view = initView(editorRef.value, model.value ?? '');
  setCursorToEOF(view);
};

onMounted(initEditor);
onUnmounted(destroyView);

watch(
  () => model.value,
  (newValue) => {
    if (isInternalUpdate) return;
    updateContent(newValue ?? '');
  }
);

watch(
  () => props.readonly,
  (value) => setReadonly(value ?? false)
);
</script>

<style lang="scss">
@import './RichEditor.scss';
</style>
