<template>
  <q-page class="center-container">
    <div v-if="creating || !notesStore.total" class="fit column-center">
      <loader-spinner v-if="creating" />
      <div
        v-else-if="!notesStore.total"
        @click="createNote"
        class="full-width column-center gap-8 pointer"
        role="button"
      >
        <h3 class="color-main capitalize">
          {{ $t('create your first note') }}
        </h3>
        <q-icon class="color-main" name="add" size="lg"></q-icon>
      </div>
    </div>
    <div v-else class="fit flex column items-start justify-center gap-16">
      <h5 class="color-main text-italic">Welcome to OrgNote</h5>
      <pretty-card>
        <h3 class="title color-magenta flex gap-8">
          <q-icon name="schedule" />
          <div class="capitalize">{{ $t('recent notes') }}</div>
        </h3>
        <div class="body text-h6">
          <note-relative-path :notes="notesStatisticStore.recentNotes" />
        </div>
      </pretty-card>
      <pretty-card>
        <h3 class="title color-magenta capitalize flex gap-8">
          <q-icon name="bookmark" />
          <div class="capitalize">
            {{ $t('bookmarks') }}
          </div>
        </h3>
        <div class="body text-h6 color-main">
          <note-relative-path
            :notes="notesStatisticStore.bookmarkedNotes"
            empty-text="no bookmarks yet"
            before-action-icon="o_cancel"
            @before-action-icon="toggleBookmark"
          />
        </div>
      </pretty-card>
      <pretty-card>
        <h3 class="title color-magenta capitalize flex gap-8">
          <q-icon name="tag" />
          <div class="capitalize">
            {{ $t('tags') }}
          </div>
        </h3>
        <div class="body text-h6 color-main">
          <tag-list
            v-if="notesStatisticStore.mostUsedTags.length"
            :tags="notesStatisticStore.mostUsedTags"
            :with-hash="true"
          />
          <no-data v-else>
            {{ $t('no tags yet') }}
          </no-data>
        </div>
      </pretty-card>
      <div
        @click="createNote"
        class="full-width text-center flex row items-center justify-center gap-8 pointer color-main active pa-y-lg"
        role="button"
      >
        <h6 class="capitalize">
          <q-icon name="add" size="sm"></q-icon>
          {{ $t('create note') }}
        </h6>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';

import LoaderSpinner from 'src/components/LoaderSpinner.vue';
import TagList from 'src/components/TagList.vue';
import NoteRelativePath from 'src/components/containers/NoteRelativePath.vue';
import NoData from 'src/components/ui/NoData.vue';
import PrettyCard from 'src/components/ui/PrettyCard.vue';
import { useNotesStore } from 'src/stores/notes';
import { useNotesStatisticStore } from 'src/stores/notes-statistic';
import { Note, NotePreview } from 'orgnote-api';
import { useNoteCreatorStore } from 'src/stores/note-creator';

const notesStore = useNotesStore();

notesStore.loadTotal();
const noteCreatorStore = useNoteCreatorStore();

const creating = ref<boolean>();
const createNote = async () => {
  creating.value = true;
  await noteCreatorStore.create();
};

const notesStatisticStore = useNotesStatisticStore();

onBeforeMount(async () => {
  await notesStatisticStore.loadStatistic();
});

const toggleBookmark = async (note: Note | NotePreview) => {
  await notesStore.toggleBookmark(note);
  await notesStatisticStore.loadBookmarks();
};
</script>

<style lang="scss" scoped>
.body {
  padding: var(--block-padding-md);
  padding-left: var(--block-padding-lg);
}
</style>
