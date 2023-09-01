import { defineStore } from 'pinia';
import { repositories } from 'src/boot/repositories';
import { ref } from 'vue';

export const useSyncStore = defineStore(
  'sync',
  () => {
    const lastSyncTime = ref<Date>();

    const syncNotes = async () => {
      console.log('✎: [line 9][sync] lastSyncTyme: ', lastSyncTime.value);
      const notesFromLastSync =
        await repositories.notes.getNotesAfterUpdateTime(lastSyncTime.value);
      console.log('✎: [line 13][sync] notesFromLastSync: ', notesFromLastSync);
      lastSyncTime.value = new Date();
    };

    return {
      syncNotes,
      lastSyncTime,
    };
  },
  { persist: true }
);
