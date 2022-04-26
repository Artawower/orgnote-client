<template>
  <a :href="content.rawLink" target="_blank">
    <content-renderer
      v-for="(c, i) in content.children"
      :content="c"
      :key="i"
    ></content-renderer>
  </a>
</template>

<script setup lang="ts">
import { Link } from 'uniorg';
import { defineComponent, toRef } from 'vue';
import ContentRenderer from './ContentRenderer.vue';

defineComponent({
  ContentRenderer,
});

const props = defineProps<{
  content: Link;
}>();

const content = toRef(props, 'content');
</script>
