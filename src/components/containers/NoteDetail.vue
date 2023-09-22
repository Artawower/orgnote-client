<template>
  <h1>{{ note?.meta.title }}</h1>
  <div class="q-pt-md">
    <file-path v-if="note" :file-path="note.filePath"></file-path>
  </div>
  <h4 class="note-description">{{ note?.meta.description }}</h4>
  <image-resolver v-if="note?.meta.previewImg" :src="note.meta.previewImg" />
  <div class="note-content">
    <content-renderer v-if="orgTree" :node="orgTree"></content-renderer>
  </div>
  <note-footer :note="note" class="q-pt-md">
    <tag-list
      :tags="note?.meta?.fileTags"
      :inline="false"
      class="q-pa-sm q-ma-sm"
    />
  </note-footer>
</template>

<script lang="ts" setup>
import { toRef } from 'vue';

import { OrgNode } from 'org-mode-ast';

import ContentRenderer from 'components/ContentRenderer.vue';
import NoteFooter from 'components/NoteFooter.vue';
import TagList from 'components/TagList.vue';
import FilePath from 'components/containers/FilePath.vue';
import ImageResolver from 'components/containers/ImageResolver.vue';

import { Note } from 'src/models';
import { ToolBarAction, useCurrentNoteStore } from 'src/stores';
import { RouteNames } from 'src/router/routes';
import { useRouter } from 'vue-router';
import { onChangeToolbarActions } from 'src/hooks';

const props = defineProps<{
  note?: Note;
  orgTree?: OrgNode;
}>();

const note = toRef(props, 'note');
const orgTree = toRef(props, 'orgTree');

const router = useRouter();
const currentNoteStore = useCurrentNoteStore();

const changeMainAction = (): ToolBarAction => {
  if (!note.value?.isMy) {
    return;
  }
  return {
    icon: 'edit',
    name: 'edit',
    sidebarPosition: 'top',
    handler: () => {
      router.push({
        name: RouteNames.EditNote,
        params: { id: currentNoteStore.currentNote?.id },
      });
    },
  };
};

onChangeToolbarActions({
  setupMainAction: changeMainAction,
  observe: note,
});
</script>

<style lang="scss" scoped>
.note-description {
  color: var(--description-font-color);
  font-style: var(--description-font-style);
  padding: var(--description-padding, 16px 0px);
}
</style>
