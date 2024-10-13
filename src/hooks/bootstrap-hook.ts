import { useAppLockerStore } from 'src/stores/app-locker.store';
import { useExtensionsStore } from 'src/stores/extensions';
import { useFileManagerStore } from 'src/stores/file-manager';
import { useFileSystemStore } from 'src/stores/file-system.store';
import { useNoteEncryptionTasksStore } from 'src/stores/note-encryption-tasks.store';
import { useNotesStore } from 'src/stores/notes';
import { useSettingsStore } from 'src/stores/settings';
import { useSyncStore } from 'src/stores/sync';
import { ref } from 'vue';
import { onBeforeMount } from 'vue';

export function useBootstrap() {
  const appReady = ref<boolean>(!process.env.CLIENT);

  const { config } = useSettingsStore();

  const extensionsStore = useExtensionsStore();
  const notesStore = useNotesStore();

  useNoteEncryptionTasksStore();
  useAppLockerStore();
  useSyncStore();

  const fileSystemStore = useFileSystemStore();
  const fileManagerStore = useFileManagerStore();

  onBeforeMount(async () => {
    await extensionsStore.loadActiveExtensions();
    await extensionsStore.loadExtensions();
    await extensionsStore.initBuiltInExtensions();
    await fileSystemStore.initFileSystem();
    await notesStore.syncWithFs();
    fileManagerStore.updateFileManager();
    appReady.value = true;
  });

  const bootstrapped = appReady;

  return {
    bootstrapped,
  };
}
