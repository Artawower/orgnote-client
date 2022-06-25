<template>
  <b>
    <content-renderer
      v-for="(c, i) of content.children"
      :key="i"
      :content="c"
    ></content-renderer>
  </b>
</template>

<script lang="ts" setup>
import { toRef } from 'vue';
import { Bold } from 'uniorg';

import ContentRenderer from './ContentRenderer.vue';

const props = defineProps<{
  content: {
    type: Bold;
  };
}>();

const content = toRef(props, 'content');
</script>
