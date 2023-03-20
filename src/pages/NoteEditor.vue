<template>
  <div class="row">
    <public-note-view v-if="previewMode" :note="note"></public-note-view>
    <org-editor
      v-else
      v-model="orgData"
      @cursorPositionChanged="setCursorPosition"
    ></org-editor>
    <editor-modeline
      @previewModeChanged="changePreviewMode"
      :previewMode="previewMode"
      :cursorPosition="cursorPosition"
    ></editor-modeline>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { parse } from 'org-mode-ast';

import OrgEditor from 'src/components/OrgEditor.vue';
import EditorModeline from 'src/components/EditorModeline.vue';
import PublicNoteView from 'src/components/PublicNoteView.vue';

const route = useRoute();
const isEditMode = !!route.params.id;
// TODO: master load the editable note

const previewMode = ref(false);
const changePreviewMode = (mode: boolean) => {
  previewMode.value = mode;
  if (previewMode.value) {
    note = collectNote(orgData);
  }
};
const orgData = ref<OrgData>(null);

const cursorPosition = ref<number>(0);
const setCursorPosition = (pos: number) => {
  cursorPosition.value = pos;
};
</script>
