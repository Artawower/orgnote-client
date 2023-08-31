import { defineStore } from 'pinia';

export const useSyncStore = defineStore('sync', () => {
  const syncNotes = async () => {
    console.log(`✎: [sync.ts][${new Date().toString()}] sync notes`);
  };

  return {
    syncNotes,
  };
});
