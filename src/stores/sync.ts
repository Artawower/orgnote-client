import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { repositories } from 'src/boot/repositories';
import { ref } from 'vue';
import { useAuthStore } from './auth';
import { useNotesStore } from './notes';

export const useSyncStore = defineStore(
  'sync',
  () => {
    const lastSyncTime = ref<string>();

    const notesStore = useNotesStore();
    const authStore = useAuthStore();

    // TODO: master add debounce with timeout and accumulation
    const syncNotes = async () => {
      if (!authStore.user) {
        return;
      }
      const notesFromLastSync =
        await repositories.notes.getNotesAfterUpdateTime(lastSyncTime.value);

      const deletedNotesIds = (await repositories.notes.getDeletedNotes()).map(
        (n) => n.id
      );

      console.log(
        '✎: [line 24][sync] lastSyncTime: ',
        typeof lastSyncTime.value
      );
      const rspns = await sdk.notes.notesSyncPost({
        notes: notesFromLastSync,
        deletedNotesIds,
        timestamp: lastSyncTime.value ?? new Date(0).toISOString(),
      });

      notesStore.deleteNotes(rspns.data.data.deletedNotes.map((n) => n.id));
      notesStore.upsertNotes(rspns.data.data.notes);

      lastSyncTime.value = new Date().toISOString();
    };

    return {
      syncNotes,
      lastSyncTime,
    };
  },
  { persist: true }
);
