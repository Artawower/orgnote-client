import { AndroidFileSystemPermission } from 'src/plugins/android-file-system-permissions.plugin';
import { useAppLockerStore } from 'src/stores/app-locker.store';
import { useExtensionsStore } from 'src/stores/extensions';
import { useNoteEncryptionTasksStore } from 'src/stores/note-encryption-tasks.store';
import { useNotesStore } from 'src/stores/notes';
import { useSyncStore } from 'src/stores/sync';
import { mockAndroid } from 'src/tools/mock-mobile';
import { ref } from 'vue';
import { onBeforeMount } from 'vue';

export function useBootstrap() {
  const appReady = ref<boolean>(!process.env.CLIENT);

  const extensionsStore = useExtensionsStore();
  const notesStore = useNotesStore();
  useNoteEncryptionTasksStore();
  useAppLockerStore();
  useSyncStore();

  onBeforeMount(async () => {
    await extensionsStore.loadActiveExtensions();
    await extensionsStore.loadExtensions();
    await extensionsStore.initBuiltInExtensions();
    await mockAndroid(AndroidFileSystemPermission.requestAccess)();
    await notesStore.syncWithFs();
    appReady.value = true;
  });

  const bootstrapped = appReady;

  return {
    bootstrapped,
  };
}
