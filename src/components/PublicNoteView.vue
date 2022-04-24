<template>
  <q-card class="my-card" flat bordered>
    <q-card-section horizontal>
      <q-card-section class="q-pt-xs">
        <div class="text-overline">{{ note.meta.category }}</div>
        <div
          class="text-h5 q-mt-sm q-mb-xs pointer"
          @click="openNoteDetail(note)"
        >
          {{ note.meta.title }}
        </div>
        <div class="text-caption text-grey">
          {{ note.meta.description }}
        </div>
      </q-card-section>

      <q-card-section class="col-5 flex flex-center">
        <q-img
          class="pointer rounded-borders"
          src="https://cdn.quasar.dev/img/parallax2.jpg"
        />
      </q-card-section>
    </q-card-section>

    <q-separator />

    <q-card-actions>
      <q-btn flat round icon="event" />
      <q-btn flat> 7:30PM </q-btn>
      <q-btn @click="openNoteDetail(note)" flat color="primary">
        {{ $t('read') }}
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { useRouter } from 'vue-router';

import { Note } from 'second-brain-parser/dist/parser/models';

import { RouteNames } from 'src/router/routes';
import { useNotesStore } from 'src/stores/notes';

const props = defineProps<{
  note: Note;
}>();
const { note } = toRefs(props);

const notesStore = useNotesStore();
const router = useRouter();

const openNoteDetail = (note: Note) => {
  notesStore.selectNote(note);
  router.push({ name: RouteNames.NoteView, params: { id: note.id } });
};
</script>
