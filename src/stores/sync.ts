import { useAuthStore } from './auth';
import { useNoteEditorStore } from './note-editor';
import { useNotesStore } from './notes';
import { AxiosError, CanceledError } from 'axios';
import { defineStore } from 'pinia';
import { debounce } from 'quasar';
import { sdk } from 'src/boot/axios';

import { computed, ref, watch } from 'vue';
import { useEncryptionErrorHandler } from 'src/hooks/use-encryption-error-handler';
import { HandlersCreatingNote, ModelsPublicNote } from 'orgnote-api/remote-api';
import { db, repositories } from 'src/boot/repositories';
import type { Note, SyncStore } from 'orgnote-api/models';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';
import { useSettingsStore } from './settings';
import { useFileSystemStore } from 'src/stores/file-system.store';
import { isOrgGpgFile, unarmor } from 'orgnote-api';
import { readFromStream } from 'src/tools/read-from-stream.tool';
import { onMounted } from 'vue';

export const useSyncStore = defineStore<string, SyncStore>(
  'sync',
  (): SyncStore => {
    const lastSyncTime = ref<string>();
    const notesStore = useNotesStore();
    const authStore = useAuthStore();
    const fileSystemStore = useFileSystemStore();

    const syncTimeTimeout = 2000;

    let abortController: AbortController;

    const inactiveUser = computed(
      () =>
        !authStore.user || authStore.user.isAnonymous || !authStore.user.active
    );

    onMounted(() => {
      watchNoteCacheChanged();
    });

    // TODO: register custom hook!
    const watchNoteCacheChanged = () => {
      notesStore.$onAction(({ after, name }) => {
        if (name !== 'syncWithFs') {
          return;
        }
        after(() => {
          markToSync();
        });
      });
    };

    // TODO: master add debounce with timeout and accumulation
    // Use websockets instead
    const markToSync = async () => {
      runSyncTask();
    };

    const { config } = useSettingsStore();

    watch(
      () => config.synchronization.type,
      () => sync()
    );

    const sync = async () => {
      const syncDisabled = config.synchronization.type === 'none';

      if (syncDisabled || inactiveUser.value) {
        return;
      }

      await syncViaApi();
    };

    const syncViaApi = async () => {
      cancelPreviousRequest();
      const notes = await getNotesFromLastSync();

      try {
        const deletedNotesIds = (
          await repositories.notes.getDeletedNotes()
        ).map((n) => n.id);
        const rspns = await sdk.notes.notesSyncPost(
          {
            // TODO: fix misstyping
            notes,
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
        await upsertNotes(rspns.data.data.notes);
        await checkCurrentEditedNoteChanged(rspns.data.data.notes);

        await notesStore.loadTotal();
        if (!notesStore.total) {
          return;
        }

        lastSyncTime.value = new Date().toISOString();
      } catch (e: unknown) {
        handleSyncError(e as Error);
      }
    };

    const getNotesFromLastSync = async (): Promise<HandlersCreatingNote[]> => {
      const notesFromLastSync =
        await repositories.notes.getNotesAfterUpdateTime(lastSyncTime.value);
      return mapNotesToCreatingNotes(notesFromLastSync);
    };

    const mapNotesToCreatingNotes = async (
      notes: Note[]
    ): Promise<HandlersCreatingNote[]> => {
      return await Promise.all(notes.map(mapNoteToCreatingNote));
    };

    const mapNoteToCreatingNote = async (
      note: Note
    ): Promise<HandlersCreatingNote> => {
      // NOTE: disable encryption for syncing cause of privacy
      const content = await readTextFile(note.filePath, {
        type: 'disabled',
      });

      return {
        ...note,
        content,
      };
    };

    const router = useRouter();

    // TODO: move logic to command
    const forceResync = async () => {
      localStorage.removeItem('sync');
      await db.dropAll();
      await router.push({ name: RouteNames.Home });
      await fileSystemStore.removeAllFiles();
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

    const runSyncTask = debounce(sync, syncTimeTimeout);

    const cancelPreviousRequest = () => {
      abortController?.abort();
      abortController = new AbortController();
    };

    const noteEditorStore = useNoteEditorStore();
    const { readTextFile, writeFile } = useFileSystemStore();

    const upsertNotes = async (notes: ModelsPublicNote[]): Promise<void> => {
      for (const note of notes) {
        const { content, ...newNote } = note;
        const noteContent = isOrgGpgFile(newNote.filePath.slice(-1)?.[0])
          ? readFromStream(await unarmor(content))
          : content;

        await writeFile(newNote.filePath, noteContent, {
          type: 'disabled',
        });
        await notesStore.upsertNotes([newNote]);
      }
    };

    const checkCurrentEditedNoteChanged = async (updatedNotes: Note[]) => {
      const noteUpdated = updatedNotes.find(
        (un) => un.id === noteEditorStore.noteOrgData?.meta.id
      );
      if (noteUpdated) {
        noteEditorStore.setFilePath(noteUpdated.filePath);
        noteEditorStore.setNoteText(await readTextFile(noteUpdated.filePath));
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
