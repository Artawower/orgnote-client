<template>
  <a v-if="content.linkType !== 'file'" :href="content.rawLink" target="_blank">
    <content-renderer
      v-for="(c, i) in content.children"
      :content="c"
      :key="i"
    ></content-renderer>
  </a>
  <!-- TODO: master  Add attribute reading for handle width setting-->
  <a
    v-else-if="content.linkType === 'file' && !isInternalFileLink"
    :href="buildMediaFilePath(content.path)"
    target="_blank"
  >
    <img class="org-image" :src="buildMediaFilePath(content.path)" />
  </a>
</template>

<script setup lang="ts">
import { Link } from 'uniorg';
import { defineComponent, toRef } from 'vue';

import ContentRenderer from './ContentRenderer.vue';
import { buildMediaFilePath } from 'src/tools/extract-file';

const fileLinkRegexp = /^file:(.*)$/;

defineComponent({
  ContentRenderer,
});

const props = defineProps<{
  content: Link;
}>();

const content = toRef(props, 'content');

const isInternalFileLink = fileLinkRegexp.test(content.value.rawLink);
</script>

<style lang="scss">
.org-image {
  width: 100%;
  height: auto;
  cursor: pointer;
}
</style>
