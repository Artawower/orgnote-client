import { useAppLockerStore } from 'src/stores/app-locker.store';
import { useExtensionsStore } from 'src/stores/extensions';
import { useNoteEncryptionTasksStore } from 'src/stores/note-encryption-tasks.store';
import { useNotesStore } from 'src/stores/notes';
import { ref } from 'vue';
import { onBeforeMount } from 'vue';

export function useBootstrap() {
  const appReady = ref<boolean>(!process.env.CLIENT);

  const extensionsStore = useExtensionsStore();
  const notesStore = useNotesStore();
  useNoteEncryptionTasksStore();
  useAppLockerStore();

  onBeforeMount(async () => {
    await extensionsStore.loadActiveExtensions();
    await extensionsStore.loadExtensions();
    await extensionsStore.initBuiltInExtensions();
    await notesStore.syncWithFs();
    appReady.value = true;
  });

  const bootstrapped = appReady;

  return {
    bootstrapped,
  };
}
