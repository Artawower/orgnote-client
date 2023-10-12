import { useAuthStore } from './auth';
import { useNotesStore } from './notes';
import { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { repositories } from 'src/boot/repositories';

import { ref } from 'vue';

export const useSyncStore = defineStore(
  'sync',
  () => {
    const lastSyncTime = ref<string>();

    const notesStore = useNotesStore();
    const authStore = useAuthStore();

    // TODO: master add debounce with timeout and accumulation
    const syncNotes = async () => {
      if (!authStore.user || authStore.user.isAnonymous) {
        return;
      }
      const notesFromLastSync =
        await repositories.notes.getNotesAfterUpdateTime(lastSyncTime.value);

      const deletedNotesIds = (await repositories.notes.getDeletedNotes()).map(
        (n) => n.id
      );

      try {
        const rspns = await sdk.notes.notesSyncPost({
          notes: notesFromLastSync,
          deletedNotesIds,
          timestamp: lastSyncTime.value ?? new Date(0).toISOString(),
        });

        notesStore.deleteNotes(rspns.data.data.deletedNotes.map((n) => n.id));
        notesStore.upsertNotes(rspns.data.data.notes);

        lastSyncTime.value = new Date().toISOString();
      } catch (e: unknown) {
        if ((e as AxiosError).response?.status === 401) {
          return;
        }
        throw e;
      }
    };

    return {
      syncNotes,
      lastSyncTime,
    };
  },
  { persist: true }
);
