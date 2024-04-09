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
import { parse, withMetaInfo } from 'org-mode-ast';
import { useFileManagerStore } from './file-manager';
import { useEncryptionErrorHandler } from 'src/hooks/use-encryption-error-handler';

export const useSyncStore = defineStore(
  'sync',
  () => {
    const lastSyncTime = ref<string>();

    const notesStore = useNotesStore();
    const authStore = useAuthStore();
    const fileManagerStore = useFileManagerStore();

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

      try {
        const encryptedNotesFromLastSync =
          await encryptNotes(notesFromLastSync);

        const deletedNotesIds = (
          await repositories.notes.getDeletedNotes()
        ).map((n) => n.id);
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

    const { handleError } = useEncryptionErrorHandler();
    const handleSyncError = (e: Error) => {
      if (
        (e instanceof AxiosError && e.response?.status === 401) ||
        e instanceof CanceledError
      ) {
        return;
      }

      handleError(e);
      throw e;
    };

    const encryptNotes = async (notes: Note[]): Promise<Note[]> => {
      return await Promise.all(
        notes.map(async (n) => {
          if (n.meta.published) {
            return n;
          }
          return {
            ...n,
            content: await encrypt(n.content),
            meta: {},
          };
        })
      );
    };

    const decryptNotes = async (notes: Note[]): Promise<Note[]> => {
      return await Promise.all(
        notes.map(async (n) => {
          if (n.meta.published) {
            return n;
          }
          const content = await decrypt(n.content);
          const { meta } = withMetaInfo(parse(content));
          return {
            ...n,
            meta: meta as Note['meta'],
            content: await decrypt(n.content),
          };
        })
      );
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
