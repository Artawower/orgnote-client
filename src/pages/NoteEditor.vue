<template>
  <div class="q-page q-pa-md">
    <router-view />
    <mode-line>
      <q-route-tab
        :to="{ name: RouteNames.RawEditor }"
        :exact="true"
        icon="draw"
        label="raw"
      ></q-route-tab>
      <q-route-tab
        :to="{ name: RouteNames.WysiwygEditor }"
        :exact="true"
        icon="wysiwyg"
        label="wysiwyg"
      ></q-route-tab>
      <q-route-tab
        :to="{ name: RouteNames.PreviewEditor }"
        :exact="true"
        icon="preview"
        :label="$t('preview')"
      ></q-route-tab>
      <q-btn @click="noteEditorStore.save" icon="save" flat></q-btn>
      <q-btn
        :icon="specialSymbolsHidden ? 'visibility_off' : 'visibility'"
        flat
        @click="specialSymbolsHidden = !specialSymbolsHidden"
      >
      </q-btn>
    </mode-line>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import ModeLine from 'src/components/ui/ModeLine.vue';
import { RouteNames } from 'src/router/routes';
import { useNoteEditorStore } from 'src/stores/note-editor';

const noteEditorStore = useNoteEditorStore();

const { specialSymbolsHidden } = storeToRefs(noteEditorStore);
</script>

<style lang="scss">
.q-page {
  box-sizing: border-box;
}
</style>
