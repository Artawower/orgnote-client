<template>
  <a v-if="content.linkType !== 'file'" :href="content.rawLink" target="_blank">
    <content-renderer
      v-for="(c, i) in content.children"
      :content="c"
      :key="i"
    ></content-renderer>
  </a>
  <!-- TODO: master  Add attribute reading for handle width setting-->
  <img
    v-else-if="content.linkType === 'file'"
    :src="buildMediaPath(content.path)"
    width="100%"
  />
</template>

<script setup lang="ts">
import { Link } from 'uniorg';
import { defineComponent, toRef } from 'vue';

import ContentRenderer from './ContentRenderer.vue';
import { extractFileNameFromPath } from 'src/tools/extract-file';

defineComponent({
  ContentRenderer,
});

const props = defineProps<{
  content: Link;
}>();

const content = toRef(props, 'content');

const buildMediaPath = (path) =>
  `http://127.0.0.1:3000/media/${extractFileNameFromPath(path)}`;
</script>
