<template>
  <a
    v-if="!['file', 'id'].find((i) => i === content.linkType)"
    :href="content.rawLink"
    target="_blank"
  >
    <content-renderer
      v-for="(c, i) in content.children"
      :content="c"
      :key="i"
    ></content-renderer>
  </a>
  <router-link v-else-if="content.linkType === 'id'" :to="idDetailPage">
    <q-tooltip class="preview-tooltip" :delay="500">
      <note-preview :id="content.path"></note-preview>
    </q-tooltip>
    <content-renderer
      v-for="(c, i) in content.children"
      :content="c"
      :key="i"
    ></content-renderer>
  </router-link>
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
import NotePreview from './NotePreview.vue';
import { buildMediaFilePath } from 'src/tools/extract-file';
import { RouteNames } from 'src/router/routes';

const fileLinkRegexp = /^file:(.*)$/;

defineComponent({
  ContentRenderer,
});

const props = defineProps<{
  content: Link;
}>();

const content = toRef(props, 'content');

const isInternalFileLink = fileLinkRegexp.test(content.value.rawLink);

const idDetailPage = {
  name: RouteNames.NoteDetail,
  params: { id: content.value.path },
};
</script>

<style lang="scss">
.org-image {
  width: 100%;
  height: auto;
  cursor: pointer;
}

.preview-tooltip {
  padding: 0;
}
</style>
