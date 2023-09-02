<template>
  <h1>{{ note?.meta.title }}</h1>
  <div class="q-pt-md">
    <file-path v-if="note" :file-path="note.filePath"></file-path>
  </div>
  <h4 class="note-description">{{ note?.meta.description }}</h4>
  <q-img
    v-if="note?.meta.previewImg"
    class="pointer rounded-borders"
    :src="buildMediaFilePath((note.meta as any).previewImg)"
  />
  <div class="note-content">
    <content-renderer v-if="orgTree" :node="orgTree"></content-renderer>
  </div>
  <note-footer :note="note" class="q-pt-md">
    <tag-list :tags="note?.meta?.fileTags" class="q-pa-sm q-ma-sm" />
  </note-footer>
</template>

<script lang="ts" setup>
import { Note } from 'src/models';
import { toRef } from 'vue';
import { buildMediaFilePath } from 'src/tools';

import ContentRenderer from 'components/ContentRenderer.vue';
import NoteFooter from 'components/NoteFooter.vue';
import TagList from 'components/TagList.vue';
import FilePath from 'components/containers/FilePath.vue';
import { OrgNode } from 'org-mode-ast';

const props = defineProps<{
  note?: Note;
  orgTree?: OrgNode;
}>();

const note = toRef(props, 'note');
const orgTree = toRef(props, 'orgTree');
</script>

<style lang="scss" scoped>
.note-description {
  color: var(--description-font-color);
  font-style: var(--description-font-style);
  padding: var(--description-padding, 16px 0px);
}
</style>
