<template>
  <q-card flat>
    <div v-if="showUserProfiles" class="q-px-md">
      <author-info :author="note.author"></author-info>
    </div>

    <q-card-section
      horizontal
      :class="{ 'note-card-content': isTile, column: isTile }"
    >
      <img v-if="isTile" src="https://cdn.quasar.dev/img/parallax2.jpg" />

      <q-card-section class="flex col-3 flex-start" v-else>
        <q-img
          class="pointer rounded-borders"
          src="https://cdn.quasar.dev/img/parallax2.jpg"
        />
      </q-card-section>
      <q-card-section>
        <div class="text-overline">{{ note.meta.category }}</div>
        <div
          class="text-h5 q-mt-sm q-mb-xs pointer"
          @click="openNoteDetail(note)"
        >
          {{ note.meta.title }}
        </div>
        <div class="text-caption text-grey rft">
          {{ note.meta.description }}
        </div>
      </q-card-section>
    </q-card-section>

    <q-separator />

    <q-card-actions>
      <q-btn flat round icon="event" />
      <q-btn flat> 7:30PM </q-btn>
      <q-btn @click="openNoteDetail(note)" flat color="primary">
        {{ $t('read') }}
      </q-btn>
      <tag-list :tags="note?.meta?.tags" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { useRouter } from 'vue-router';

import { RouteNames } from 'src/router/routes';
import { useNotesStore } from 'src/stores/notes';
import { useViewStore } from 'src/stores/view';

import TagList from 'components/TagList.vue';
import AuthorInfo from 'src/pages/AuthorInfo.vue';
import { Note } from 'src/models';
import { useSettingsStore } from 'src/stores/settings';

const props = defineProps<{
  note: Note;
}>();
const { note } = toRefs(props);

const notesStore = useNotesStore();
const router = useRouter();

const openNoteDetail = (note: Note) => {
  notesStore.selectNote(note);
  console.log(note);
  router.push({ name: RouteNames.NoteView, params: { id: note.id } });
};

const viewStore = useViewStore();
const isTile = computed(() => viewStore.tile);

const searchByTag = (tag: string) => {
  // TODO: implement search here
};

const settingsStore = useSettingsStore();

const { showUserProfiles } = toRefs(settingsStore);
</script>

<style lang="scss">
.note-card-content {
  max-height: 310px;
  min-height: 310px;
}
</style>
