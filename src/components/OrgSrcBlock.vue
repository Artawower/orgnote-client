<template>
  <pre>
    {{ content.value }}
  </pre>
</template>

<script setup lang="ts">
import { SrcBlock } from 'uniorg';
import { defineComponent, toRef } from 'vue';
import ContentRenderer from './ContentRenderer.vue';

defineComponent({
  ContentRenderer,
});

const props = defineProps<{
  content: SrcBlock;
}>();

const content = toRef(props, 'content');
</script>
