import { type FileSystemInfo, type FileSystemManagerStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useFileSystemManagerStore = defineStore<string, FileSystemManagerStore>(
  'file-system-manager',
  () => {
    const currentFsName = ref<string>('');
    const registeredFileSystems = ref<Record<string, FileSystemInfo>>({});
    const currentFsInfo = computed(() => registeredFileSystems.value[currentFsName?.value]);
    const currentFs = computed(() => currentFsInfo.value?.fs());

    const fileSystems = computed(() => Object.values(registeredFileSystems.value));

    const register = (fs: FileSystemInfo) => {
      registeredFileSystems.value = {
        ...registeredFileSystems.value,
        [fs.name]: fs,
      };
    };

    const useFs = async (fsName: string): Promise<void> => {
      currentFsName.value = fsName;
      await currentFs.value?.init();
    };

    const store: FileSystemManagerStore = {
      register,
      currentFs,
      fileSystems,
      currentFsName,
      currentFsInfo,
      useFs,
    };
    return store;
  },
  {
    persist: {
      pick: ['currentFsName'],
    },
  },
);
