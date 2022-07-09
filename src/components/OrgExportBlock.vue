<template>
  <div class="latex" v-katex:display="content.value"></div>
</template>

<script setup lang="ts">
import { ExportBlock } from 'uniorg';
import { toRef } from 'vue';

const props = defineProps<{
  content: ExportBlock;
}>();

const content = toRef(props, 'content');
</script>
