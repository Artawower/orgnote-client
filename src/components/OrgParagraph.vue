<template>
  <p v-for="(c, i) in content.children" v-bind:key="i">
    <template v-if="c.type === 'text'">{{ c.value }} </template>
  </p>
</template>

<script setup lang="ts">
import { Paragraph } from 'uniorg';
import { toRef } from 'vue';

const props = defineProps<{
  content: Paragraph;
}>();

const content = toRef(props, 'content');
console.log('cotent: ', content.value);
</script>
