<template>
  <page-wrapper>
    <img :src="imageSrc" :alt="buffer.title" />
  </page-wrapper>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { Buffer } from 'orgnote-api';
import PageWrapper from 'src/components/PageWrapper.vue';

const props = defineProps<{
  buffer: Buffer;
  readonly?: boolean;
}>();

const imageSrc = computed(() => {
  if (props.buffer.content.startsWith('data:')) {
    return props.buffer.content;
  }
  return `data:image/*;base64,${props.buffer.content}`;
});
</script>

<style lang="scss" scoped>
img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
