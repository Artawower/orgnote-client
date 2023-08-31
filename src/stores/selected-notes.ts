import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useNotesStore } from '.';

export const useSelectedNotesStore = defineStore('selected-notes', () => {
  const selectedNotesIds = ref<Set<string>>(new Set());

  const notesStore = useNotesStore();

  const allNotesSelected = computed(
    () => selectedNotesIds.value.size === notesStore.notesPreviews.length
  );

  const toggleBulkNotesSelection = () => {
    if (allNotesSelected.value) {
      selectedNotesIds.value.clear();
      return;
    }
    selectedNotesIds.value = new Set(notesStore.notesPreviews.map((n) => n.id));
  };

  const toggleNoteSelection = (noteId: string) => {
    if (selectedNotesIds.value.has(noteId)) {
      selectedNotesIds.value.delete(noteId);
      return;
    }
    selectedNotesIds.value.add(noteId);
  };

  const isNoteSelected = (noteId: string) => selectedNotesIds.value.has(noteId);

  const isAllNotesSelected = computed(() => {
    return notesStore.notesPreviews.length === selectedNotesIds.value.size;
  });

  const isSomeNotesSelected = computed(() => selectedNotesIds.value.size > 0);

  const clearSelectedNotes = () => selectedNotesIds.value.clear();

  return {
    toggleBulkNotesSelection,
    allNotesSelected,
    toggleNoteSelection,
    isNoteSelected,
    isAllNotesSelected,
    isSomeNotesSelected,
    selectedNotesIds: computed(() => [...selectedNotesIds.value]),
    clearSelectedNotes,
  };
});
