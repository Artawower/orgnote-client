<template>
  <s>
    <content-renderer :content="content"></content-renderer>
  </s>
</template>

<script setup lang="ts">
import { defineComponent, toRef } from 'vue';
import { StrikeThrough } from 'uniorg';
import ContentRenderer from './ContentRenderer.vue';

const props = defineProps<{
  content: StrikeThrough;
}>();

defineComponent({
  ContentRenderer,
});

const content = toRef(props, 'content');
console.log('qeqweqewq: ', content.value);
</script>
