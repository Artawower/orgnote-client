<template>
  <div class="loading-wrapper" v-if="loading">
    <loader-spinner></loader-spinner>
  </div>
  <q-card
    v-else-if="note"
    class="preview-card"
    :dark="$q.dark.isActive"
    bordered
  >
    <img
      v-if="note.meta.previewImg"
      :src="buildMediaFilePath(note.meta.previewImg)"
    />
    <q-card-section>
      <div class="text-h6">{{ note.meta.title }}</div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <div class="text-body2">{{ note.meta.description }}</div>
    </q-card-section>
  </q-card>
  <h1 v-else>Note found ;(</h1>
  <!-- TODO: master  add not found component-->
</template>

<script lang="ts" setup>
// TODO: master  this component should be optimized by getting
// notes from cache

import { sdk } from 'src/boot/axios';
import LoaderSpinner from 'src/components/LoaderSpinner.vue';
import { ref } from 'vue';
import { Note } from 'src/models';
import { buildMediaFilePath } from 'src/tools';

const props = defineProps<{
  id: string;
}>();

const loading = ref(true);
const note = ref<Note | null>(null);

sdk
  .getNote(props.id)
  .then((r) => {
    note.value = r.data;
  })
  .finally(() => {
    loading.value = false;
  });
</script>

<style lang="scss">
.preview-card,
.loading-wrapper {
  max-width: 400px;
}
.loading-wrapper {
  @include flexify(row, center, center);
  width: 400px;
  height: 200px;
}
</style>
