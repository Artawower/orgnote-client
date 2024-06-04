import { defineStore } from 'pinia';
import { NotePreview } from 'src/models';

import { ref } from 'vue';
import { repositories } from 'src/boot/repositories';

export const useNotesStatisticStore = defineStore('notes-statistic', () => {
  const recentNotes = ref<NotePreview[]>([]);
  const mostUsedTags = ref<string[]>([]);
  const bookmarkedNotes = ref<NotePreview[]>([]);

  const maximumStatisticItems = 5;

  const loadStatistic = async () => {
    await loadPopularNotes();
    await loadMostUsedTags();
    await loadBookmarks();
  };

  const loadPopularNotes = async () => {
    recentNotes.value = await repositories.notes.getNotePreviews({
      limit: maximumStatisticItems,
      offset: 0,
    });
  };

  const loadMostUsedTags = async () => {
    mostUsedTags.value = (await repositories.notes.getTagsStatistic())
      .slice(0, maximumStatisticItems)
      .map((s) => s.tag);
  };

  const loadBookmarks = async () => {
    bookmarkedNotes.value = await repositories.notes.getNotePreviews({
      limit: maximumStatisticItems,
      offset: 0,
      bookmarked: true,
    });
  };

  return {
    recentNotes,
    mostUsedTags,
    bookmarkedNotes,

    loadStatistic,
    loadBookmarks,
    loadPopularNotes,
    loadMostUsedTags,
  };
});
