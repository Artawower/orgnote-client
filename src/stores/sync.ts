import { useAuthStore } from './auth';
import { useNoteEditorStore } from './note-editor';
import { useNotesStore } from './notes';
import { AxiosError, CanceledError } from 'axios';
import { defineStore } from 'pinia';
import { debounce } from 'quasar';
import { sdk } from 'src/boot/axios';
import { useEncryption } from 'src/hooks';

import { ref, watch } from 'vue';
import { useFileManagerStore } from './file-manager';
import { useEncryptionErrorHandler } from 'src/hooks/use-encryption-error-handler';
import { HandlersCreatingNote } from 'orgnote-api/remote-api';
import { db, repositories } from 'src/boot/repositories';
import { Note } from 'orgnote-api/models';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';
import { useSettingsStore } from './settings';

export const useSyncStore = defineStore(
  'sync',
  () => {
    const lastSyncTime = ref<string>();
    const notesStore = useNotesStore();
    const authStore = useAuthStore();
    const fileManagerStore = useFileManagerStore();

    const syncTimeTimeout = 5000;

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

    const { encryptNote, decryptNote } = useEncryption();

    const { config } = useSettingsStore();

    watch(
      () => config.synchronization.type,
      () => sync()
    );

    const sync = async () => {
      if (config.synchronization.type === 'none') {
        return;
      }
      if (config.synchronization.type === 'filesystem') {
        return;
      }
      await syncViaApi();
    };

    const syncViaApi = async () => {
      cancelPreviousRequest();
      const notesFromLastSync =
        await repositories.notes.getNotesAfterUpdateTime(lastSyncTime.value);

      try {
        const encryptedNotesFromLastSync =
          await encryptNotes(notesFromLastSync);

        const deletedNotesIds = (
          await repositories.notes.getDeletedNotes()
        ).map((n) => n.id);
        const rspns = await sdk.notes.notesSyncPost(
          {
            // TODO: fix misstyping
            notes:
              encryptedNotesFromLastSync as unknown as HandlersCreatingNote[],
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
        const decryptedNotes = await decryptNotes(rspns.data.data.notes);
        await notesStore.upsertNotes(decryptedNotes);
        checkCurrentEditedNoteChanged(decryptedNotes);

        await notesStore.loadTotal();
        if (!notesStore.total) {
          return;
        }

        lastSyncTime.value = new Date().toISOString();
        fileManagerStore.updateFileManager();
      } catch (e: unknown) {
        handleSyncError(e as Error);
      }
    };

    const router = useRouter();

    // TODO: move logic to command
    const forceResync = async () => {
      localStorage.removeItem('sync');
      await db.dropAll();
      await router.push({ name: RouteNames.Home });
      window.location.reload();
    };

    const { handleError } = useEncryptionErrorHandler();
    const handleSyncError = (e: Error) => {
      if (
        (e instanceof AxiosError && e.response?.status === 401) ||
        e instanceof CanceledError
      ) {
        return;
      }

      handleError(e);
    };

    const encryptNotes = async (notes: Note[]): Promise<Note[]> => {
      return await Promise.all(notes.map(async (n) => encryptNote(n)));
    };

    const decryptNotes = async (notes: Note[]): Promise<Note[]> => {
      return await Promise.all(
        notes.map(async (n) => {
          return await decryptNote(n);
        })
      );
    };

    const runSyncTask = debounce(sync, syncTimeTimeout);

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

    const reset = () => {
      lastSyncTime.value = null;
    };

    return {
      markToSync,
      sync,
      forceResync,
      lastSyncTime,
      reset,
    };
  },
  { persist: true }
);
