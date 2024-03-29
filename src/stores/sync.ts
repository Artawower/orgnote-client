import { useAuthStore } from './auth';
import { useNoteEditorStore } from './note-editor';
import { useNotesStore } from './notes';
import { AxiosError, CanceledError } from 'axios';
import { defineStore } from 'pinia';
import { debounce } from 'quasar';
import { sdk } from 'src/boot/axios';
import { repositories } from 'src/boot/repositories';
import { useEncryption } from 'src/hooks';
import { Note } from 'src/models';

import { ref } from 'vue';

export const useSyncStore = defineStore(
  'sync',
  () => {
    const lastSyncTime = ref<string>();

    const notesStore = useNotesStore();
    const authStore = useAuthStore();
    let abortController: AbortController;

    // TODO: master add debounce with timeout and accumulation
    // Use websockets instead
    const markToSync = async () => {
      if (
        !authStore.user ||
        authStore.user.isAnonymous ||
        !authStore.user.active
      ) {
        return;
      }
      runSyncTask();
    };

    const { encrypt, decrypt } = useEncryption();

    const sync = async () => {
      cancelPreviousRequest();
      const notesFromLastSync =
        await repositories.notes.getNotesAfterUpdateTime(lastSyncTime.value);

      const encryptedNotesFromLastSync = await Promise.all(
        notesFromLastSync.map(async (n) => ({
          ...n,
          content: await decrypt(n.content),
        }))
      );

      const deletedNotesIds = (await repositories.notes.getDeletedNotes()).map(
        (n) => n.id
      );

      try {
        const rspns = await sdk.notes.notesSyncPost(
          {
            notes: encryptedNotesFromLastSync,
            deletedNotesIds,
            timestamp: lastSyncTime.value ?? new Date(0).toISOString(),
          },
          {
            signal: abortController.signal,
          }
        );

        await notesStore.deleteNotes(
          rspns.data.data.deletedNotes.map((n) => n.id)
        );
        await notesStore.upsertNotes(rspns.data.data.notes);
        checkCurrentEditedNoteChanged(rspns.data.data.notes);

        await notesStore.loadTotal();
        if (!notesStore.total) {
          return;
        }

        lastSyncTime.value = new Date().toISOString();
      } catch (e: unknown) {
        if (
          (e as AxiosError).response?.status === 401 ||
          e instanceof CanceledError
        ) {
          return;
        }
        throw e;
      }
    };

    const runSyncTask = debounce(sync, 5000);

    const cancelPreviousRequest = () => {
      abortController?.abort();
      abortController = new AbortController();
    };

    const noteEditorStore = useNoteEditorStore();
    const checkCurrentEditedNoteChanged = (updatedNotes: Note[]) => {
      const noteUpdated = updatedNotes.find(
        (un) => un.id === noteEditorStore.noteOrgData?.meta.id
      );
      if (noteUpdated) {
        noteEditorStore.setFilePath(noteUpdated.filePath);
        noteEditorStore.setNoteText(noteUpdated.content);
        noteEditorStore.setCreatedTime(noteUpdated.createdAt);
      }
    };

    return {
      markToSync,
      sync,
      lastSyncTime,
    };
  },
  { persist: true }
);
