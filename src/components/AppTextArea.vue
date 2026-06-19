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
  />
</template>

<script lang="ts" setup>
import { ref } from 'vue';

defineProps<{
  placeholder?: string;
  name?: string;
  autocomplete?: string;
  autofocus?: boolean;
  disable?: boolean;
  rows?: number;
}>();

const model = defineModel<string>();
const textAreaRef = ref<HTMLTextAreaElement | undefined>();

const focus = () => {
  textAreaRef.value?.focus();
};

defineExpose({ focus });
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
