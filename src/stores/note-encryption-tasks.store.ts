import { defineStore } from 'pinia';
import { computed, reactive, ref, watch } from 'vue';
import { useSettingsStore } from './settings';
import { isGpgEncrypted, OrgNoteEncryption } from 'orgnote-api';
import { onMounted } from 'vue';
import { is } from 'quasar';
import { repositories } from 'src/boot/repositories';
import { useFileSystemStore } from './file-system.store';
import { useAppLockerStore } from './app-locker.store';
import { useNotesStore } from './notes';
import { useSyncStore } from './sync';
import { useCurrentNoteStore } from './current-note';
import { useEncryptionErrorHandler } from 'src/hooks/use-encryption-error-handler';
import { useNotifications } from 'src/hooks';

export type TaskProgressStatus = 'pending' | 'in-progress' | 'done' | 'error';

interface TaskProgress {
  status: TaskProgressStatus;
  error?: string;
}

interface Progress {
  [noteId: string]: TaskProgress;
}

export const useNoteEncryptionTasksStore = defineStore(
  'note-encryption-tasks',
  () => {
    const lockId = 'NOTE_ENCRYPTION';
    const progress = ref<Progress>({});
    const loadingStatuses: TaskProgressStatus[] = ['pending', 'in-progress'];
    const loading = computed(() =>
      Object.values(progress.value).some((p) =>
        loadingStatuses.includes(p.status)
      )
    );

    const completedTasksCount = computed(
      () =>
        Object.values(progress.value).filter((p) => p.status === 'done').length
    );
    const totalTasksCount = computed(() => Object.keys(progress.value).length);

    const appLockerStore = useAppLockerStore();

    watch(
      () => [completedTasksCount.value, totalTasksCount.value],
      ([c, t]) => {
        appLockerStore.doneTasksCount = c;
        appLockerStore.totalTasksCount = t;
        appLockerStore.locked = loading.value;
      }
    );

    const { config } = useSettingsStore();

    const newEncryption = reactive<{ data: OrgNoteEncryption }>({
      data: { ...config.encryption },
    });

    onMounted(async () => {
      initEncryptionMethod();
      resetInProgressTasks();
      completeMigrationTasks();
    });

    const initEncryptionMethod = () => {
      if (!loading.value) {
        Object.assign(newEncryption.data, config.encryption);
      }
    };

    const resetInProgressTasks = () => {
      progress.value = Object.keys(progress.value).reduce<Progress>(
        (acc, id) => {
          const noteProgress = progress.value[id];
          if (noteProgress.status === 'in-progress') {
            acc[id] = { ...noteProgress, status: 'pending' };
          }
          return acc;
        },
        {}
      );
    };

    const undoneEncryptionMigration = ref<boolean>(false);

    watch(
      () => [newEncryption.data, config.encryption],
      () => {
        const changed = !is.deepEqual(config.encryption, newEncryption.data);
        undoneEncryptionMigration.value = changed;
      },
      { deep: true }
    );

    const encryptExistingNotes = async () => {
      await initEncryptionProgress();
    };

    const { readTextFile } = useFileSystemStore();

    const encryptionErrorHandler = useEncryptionErrorHandler();
    const notifcations = useNotifications();

    const initEncryptionProgress = async () => {
      const notesIds = await repositories.notes.getIds(() => true);

      const encryptedNoteIds = await Promise.all(
        notesIds.filter(async (id) => {
          const note = await repositories.notes.getById(id);
          const content = await readTextFile(note.filePath);
          return isGpgEncrypted(content);
        })
      );

      progress.value = encryptedNoteIds.reduce<Progress>((acc, id) => {
        acc[id] = { status: 'pending' };
        return acc;
      }, {});

      await completeMigrationTasks();
    };

    const completeMigrationTasks = async () => {
      if (!loading.value) {
        appLockerStore.unlock(lockId);
        return;
      }

      for (const [id, task] of Object.entries(progress.value)) {
        if (task.status !== 'pending') {
          updateProgressTaskStatus(id, 'in-progress');
        }
        try {
          await reencryptNoteById(id);
          updateProgressTaskStatus(id, 'done');
        } catch (e) {
          updateProgressTaskStatus(
            id,
            'error',
            (e as unknown as { message: string }).message
          );
        }
      }

      await completeEncryptionMigrations();
    };

    const { getNoteContent, updateNoteContent } = useCurrentNoteStore();
    const reencryptNoteById = async (noteId: string) => {
      const noteContent =
        await readNoteContentByNewOrOldEncryptionMethod(noteId);
      if (isGpgEncrypted(noteContent)) {
        return;
      }
      await updateNoteContent(noteId, noteContent, newEncryption.data);
    };

    // NOTE: In some cases, a new key could be good for already decrypted data.
    const readNoteContentByNewOrOldEncryptionMethod = async (
      noteId: string
    ) => {
      try {
        return await getNoteContent(noteId);
      } catch (e) {
        return await getNoteContent(noteId, newEncryption.data);
      }
    };

    const updateProgressTaskStatus = (
      id: string,
      status: TaskProgressStatus,
      error?: string
    ) => {
      progress.value = { ...progress.value, [id]: { status, error } };
    };

    const notesStore = useNotesStore();
    const syncStore = useSyncStore();
    const currentNoteStore = useCurrentNoteStore();

    const completeEncryptionMigrations = async () => {
      progress.value = {};
      config.encryption = { ...newEncryption.data };
      await notesStore.loadNotes();
      await updateEncryptedNotesDate();
      await syncStore.sync();
      await currentNoteStore.reloadCurrentNote();
    };

    const updateEncryptedNotesDate = async () => {
      const encryptedNotes = await repositories.notes.getIds(
        (n) => !n.meta.published
      );
      const notesUpdates = encryptedNotes.map((id) => ({
        id,
        changes: { updatedAt: new Date().toISOString() },
      }));

      await notesStore.bulkPathNotesLocally(notesUpdates);
    };

    return {
      progress,
      loading,
      completedTasksCount,
      totalTasksCount,
      newEncryption,
      undoneEncryptionMigration,
      encryptExistingNotes,
      completeMigrationTasks,
    };
  },
  {
    persist: true,
  }
);
