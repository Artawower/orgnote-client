<template>
  <source-code-editor v-model="content" :readonly="readonly" :language="language" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { getFileExtension, type Buffer } from 'orgnote-api';
import { SourceCodeEditor } from 'src/containers/SourceCodeEditor';

const props = defineProps<{
  buffer: Buffer;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:content', content: string): void;
}>();

const content = computed({
  get: () => props.buffer.text,
  set: (value: string) => emit('update:content', value),
});

const language = computed(() => getFileExtension(props.buffer.path)?.toLowerCase());
</script>
