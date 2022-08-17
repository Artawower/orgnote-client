<template>
  <q-card flat>
    <div v-if="showUserProfiles && showAuthor" class="q-px-md">
      <author-info :author="note.author"></author-info>
    </div>

    <q-card-section
      horizontal
      :class="{ 'note-card-content': isTile, column: isTile }"
    >
      <img
        v-if="isTile && note?.meta.previewImg"
        :src="buildMediaFilePath(note.meta.previewImg)"
      />
      <q-card-section class="flex col-3 flex-start" v-else>
        <q-img
          v-if="note?.meta.previewImg"
          class="pointer rounded-borders"
          :src="buildMediaFilePath(note.meta.previewImg)"
        />
        <!-- TODO: add fine markup for notes without preview-->
        <div v-else class="mock-picture pointer rounded-borders"></div>
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
import { buildMediaFilePath } from 'src/tools';

const props = defineProps<{
  note: Note;
  showAuthor: boolean;
}>();
const { note } = toRefs(props);

const notesStore = useNotesStore();
const router = useRouter();

const openNoteDetail = (note: Note) => {
  notesStore.selectNote(note);
  router.push({ name: RouteNames.NoteDetail, params: { id: note.id } });
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

.mock-picture {
  width: 230px;
  height: 134px;
  background-color: $blue-grey-2;
}
</style>
