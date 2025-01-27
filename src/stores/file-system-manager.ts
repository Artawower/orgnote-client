import type { FileSystemInfo, FileSystemManagerStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useFileSystemManagerStore = defineStore<string, FileSystemManagerStore>(
  'file-system-manager',
  () => {
    const currentFsName = ref<string>('');
    const registeredFileSystems = ref<Record<string, FileSystemInfo>>({});
    const currentFs = computed(() => registeredFileSystems.value[currentFsName?.value]?.fs);

    const fileSystems = computed(() => Object.values(registeredFileSystems.value));

    const register = (fs: FileSystemInfo) => {
      registeredFileSystems.value = {
        ...registeredFileSystems.value,
        [fs.name]: fs,
      };
    };

    const store: FileSystemManagerStore = {
      register,
      currentFs,
      fileSystems,
      currentFsName,
    };
    return store;
  },
  {
    persist: {
      pick: ['currentFsName'],
    },
  },
);
