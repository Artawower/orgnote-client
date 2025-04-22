import { type FileSystemInfo, type FileSystemManagerStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useSettingsStore } from './settings';
import { watch } from 'vue';

export const useFileSystemManagerStore = defineStore<string, FileSystemManagerStore>(
  'file-system-manager',
  () => {
    const currentFsName = ref<string>('');
    const registeredFileSystems = ref<Record<string, FileSystemInfo>>({});
    const currentFsInfo = computed(() => registeredFileSystems.value[currentFsName?.value]);
    const currentFs = computed(() => currentFsInfo.value?.fs());
    const settings = useSettingsStore();
    const fsMounted = ref(false);

    const fileSystems = computed(() => Object.values(registeredFileSystems.value));

    const register = (fs: FileSystemInfo) => {
      registeredFileSystems.value = {
        ...registeredFileSystems.value,
        [fs.name]: fs,
      };
    };

    const useFs = async (fsName: string): Promise<void> => {
      currentFsName.value = fsName;
      const params = await currentFs.value?.init({
        root: settings.settings.vault,
      });
      if (params && 'root' in params) {
        settings.settings.vault = params.root;
      }
    };

    watch(
      () => currentFs.value,
      (fs) => {
        if (!fs || fsMounted.value) {
          return;
        }
        fs.mount({ root: settings.settings.vault });
      },
    );

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
