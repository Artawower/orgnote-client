<template>
  <textarea
    ref="textAreaRef"
    v-model="model"
    :placeholder="placeholder"
    :name="name"
    :autocomplete="autocomplete"
    :autofocus="autofocus"
    :disabled="disable"
    :rows="rows"
    @input="adjustHeight"
  />
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  placeholder?: string;
  name?: string;
  autocomplete?: string;
  autofocus?: boolean;
  disable?: boolean;
  rows?: number;
  autoGrow?: boolean;
}>();

const model = defineModel<string>();
const textAreaRef = ref<HTMLTextAreaElement | undefined>();

const resizeTextArea = (): void => {
  if (!props.autoGrow) return;
  const textArea = textAreaRef.value;
  if (!textArea) return;
  textArea.style.height = 'auto';
  textArea.style.height = `${textArea.scrollHeight}px`;
};

const adjustHeight = (): void => {
  void nextTick(resizeTextArea);
};

const focus = (): void => {
  textAreaRef.value?.focus();
};

const focusEnd = (): void => {
  const textArea = textAreaRef.value;
  if (!textArea) return;

  textArea.focus();
  const caret = textArea.value.length;
  textArea.setSelectionRange(caret, caret);
};

watch(() => model.value, adjustHeight);
onMounted(adjustHeight);

defineExpose({ focus, focusEnd });
</script>

<style lang="scss" scoped>
textarea {
  color: var(--fg);
  border: none;
  background: transparent;
  width: 100%;
  min-height: 1.5em;
  resize: none;
  overflow: hidden;
  line-height: 1.5;

  @include reset-input();

  &::placeholder {
    color: var(--placeholder-fg);
  }
}
</style>
