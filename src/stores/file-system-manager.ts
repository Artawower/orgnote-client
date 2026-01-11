import { type FileSystem, type FileSystemInfo, type FileSystemManagerStore } from 'orgnote-api';
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
    const fsInstances = ref<Record<string, FileSystem>>({});

    const getOrCreateFs = (info: FileSystemInfo): FileSystem => {
      const existing = fsInstances.value[info.name];
      if (existing) {
        return existing;
      }
      const created = info.fs();
      fsInstances.value = {
        ...fsInstances.value,
        [info.name]: created,
      };
      return created;
    };

    const currentFs = computed(() => {
      if (!currentFsInfo.value) {
        return;
      }
      return getOrCreateFs(currentFsInfo.value);
    });
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
      const info = registeredFileSystems.value[fsName];
      if (!info || info.name === currentFsName.value) {
        return;
      }

      const fs = getOrCreateFs(info);
      const params = await fs.init?.({ root: settings.settings.vault || undefined });
      if (params && 'root' in params) {
        settings.settings.vault = params.root;
      }
      currentFsName.value = fsName;
      fsMounted.value = false;
    };

    watch(
      () => currentFs.value,
      async (fs) => {
        if (!fs || fsMounted.value) {
          return;
        }
        const mounted = await fs.mount?.({ root: settings.settings.vault || undefined });
        fsMounted.value = mounted ?? false;
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
