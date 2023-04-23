<template>
  <div class="q-page q-pa-md">
    <!-- <public-note-view v-if="previewMode" :note="note"></public-note-view> -->
    <org-editor v-model="orgData"></org-editor>
    <!-- <editor-modeline
      @previewModeChanged="changePreviewMode"
      :previewMode="previewMode"
      :cursorPosition="cursorPosition"
    ></editor-modeline> -->
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import OrgEditor from '@/components/OrgEditor.vue';
import EditorModeline from '@/components/EditorModeline.vue';

const orgData = ref<string>('');
</script>

<style lang="scss">
.q-page {
  box-sizing: border-box;
}
</style>
