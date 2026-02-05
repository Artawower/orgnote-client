<template>
  <rich-editor v-model="content" :readonly="readonly" :file-path="buffer.path" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { Buffer } from 'orgnote-api';
import { RichEditor } from 'src/containers/RichEditor';

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
</script>
