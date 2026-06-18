import { type FileSystem, type FileSystemInfo, type FileSystemManagerStore } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { useSettingsStore } from './settings';
import { reporter } from 'src/boot/report';

interface DesiredStorageSnapshot {
  fsName: string;
  root?: string;
}

interface ReconcileContext {
  fs: FileSystem;
  snapshot: DesiredStorageSnapshot;
}

const resetFileManagerState = async (): Promise<void> => {
  const { useFileManagerStore } = await import('./file-manager');
  const fileManager = useFileManagerStore();
  fileManager.path = '/';
  fileManager.focusFile = undefined;
  fileManager.searchQuery = '';
  fileManager.mobileFileSearchActive = false;
  fileManager.files = [];
  fileManager.clearSelection();
  fileManager.cancelPending();
};

const resetSearchState = async (): Promise<void> => {
  const [{ useFileSearchStore }, { useFileMetaStore }] = await Promise.all([
    import('./file-search'),
    import('./file-meta'),
  ]);
  await useFileSearchStore().clearIndex();
  await useFileMetaStore().clear();
};

const resetQueueState = async (): Promise<void> => {
  const [{ useQueueStore }, { INDEX_QUEUE_ID, SYNC_QUEUE_ID }] = await Promise.all([
    import('./queue'),
    import('src/constants/queue-ids'),
  ]);
  const queue = useQueueStore();
  await Promise.all([queue.clear(INDEX_QUEUE_ID), queue.clear(SYNC_QUEUE_ID)]);
};

const resetSyncState = async (): Promise<void> => {
  const { useSyncStore } = await import('./sync');
  await useSyncStore().reset();
};

const resetStorageBoundState = async (): Promise<void> => {
  const result = await to(async () => {
    await Promise.all([
      resetFileManagerState(),
      resetSearchState(),
      resetQueueState(),
      resetSyncState(),
    ]);
  })();

  if (result.isErr()) {
    reporter.reportError(result.error);
  }
};

export const useFileSystemManagerStore = defineStore<string, FileSystemManagerStore>('file-system-manager',
  () => {
    const currentFsName = ref<string>('');
    const registeredFileSystems = ref<Record<string, FileSystemInfo>>({});
    const currentFsInfo = computed(() => registeredFileSystems.value[currentFsName.value]);
    const fsInstances = ref<Record<string, FileSystem>>({});
    const fsMounted = ref(false);
    const isReconciling = ref(false);
    const mountedFsName = ref('');
    const mountedVault = ref<string | undefined>();

    let hasPendingReconcile = false;
    let activeReconcile: Promise<void> | null = null;

    const settings = useSettingsStore();

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

    const fileSystems = computed(() => Object.values(registeredFileSystems.value));

    const register = (fs: FileSystemInfo) => {
      registeredFileSystems.value = {
        ...registeredFileSystems.value,
        [fs.name]: fs,
      };
    };

    const currentVault = (): string | undefined => settings.settings.vault;

    const resetMountedState = (): void => {
      fsMounted.value = false;
      mountedFsName.value = '';
      mountedVault.value = undefined;
    };

    const applyParams = (params?: { root?: string } | void): void => {
      if (!params || !('root' in params)) {
        return;
      }
      settings.settings.vault = params.root;
    };

    const createDesiredSnapshot = (fsName: string): DesiredStorageSnapshot => ({
      fsName,
      root: currentVault(),
    });

    const isCurrentDesired = (snapshot: DesiredStorageSnapshot): boolean =>
      currentFsInfo.value?.name === snapshot.fsName && currentVault() === snapshot.root;

    const isDesiredRuntimeMounted = (fsName: string, root?: string): boolean =>
      fsMounted.value && mountedFsName.value === fsName && mountedVault.value === root;

    const applyMountedState = (fsName: string, root: string | undefined, mounted: boolean): void => {
      fsMounted.value = mounted;
      mountedFsName.value = mounted ? fsName : '';
      mountedVault.value = mounted ? root : undefined;
    };

    const createReconcileContext = (): ReconcileContext | undefined => {
      const info = currentFsInfo.value;
      if (!info) {
        resetMountedState();
        return;
      }

      const snapshot = createDesiredSnapshot(info.name);
      if (isDesiredRuntimeMounted(snapshot.fsName, snapshot.root)) {
        return;
      }

      return {
        fs: getOrCreateFs(info),
        snapshot,
      };
    };

    const initializeDesiredFs = async (context: ReconcileContext): Promise<boolean> => {
      const { fs, snapshot } = context;
      const params = await fs.init?.({ root: snapshot.root });
      if (!isCurrentDesired(snapshot)) {
        return false;
      }

      applyParams(params);
      return true;
    };

    const mountDesiredFs = async (context: ReconcileContext): Promise<void> => {
      const mountSnapshot = createDesiredSnapshot(context.snapshot.fsName);
      const mounted = await context.fs.mount?.({ root: mountSnapshot.root });
      if (!isCurrentDesired(mountSnapshot)) {
        return;
      }

      applyMountedState(mountSnapshot.fsName, mountSnapshot.root, mounted ?? true);
    };

    const reconcileContext = async (context: ReconcileContext): Promise<void> => {
      const initialized = await initializeDesiredFs(context);
      if (!initialized) {
        return;
      }

      await mountDesiredFs(context);
    };

    const runReconcile = async (): Promise<void> => {
      const context = createReconcileContext();
      if (!context) {
        return;
      }

      isReconciling.value = true;
      resetMountedState();
      const result = await to(() => reconcileContext(context))();
      isReconciling.value = false;

      if (result.isErr()) {
        throw result.error;
      }
    };

    const runQueuedReconcile = async (): Promise<void> => {
      hasPendingReconcile = false;
      const result = await to(runReconcile)();
      if (result.isErr()) {
        activeReconcile = null;
        hasPendingReconcile = false;
        throw result.error;
      }

      if (!hasPendingReconcile) {
        activeReconcile = null;
        return;
      }

      activeReconcile = runQueuedReconcile();
      await activeReconcile;
    };

    const reconcileStorageRuntime = async (): Promise<void> => {
      hasPendingReconcile = true;
      activeReconcile ??= runQueuedReconcile();
      await activeReconcile;
    };

    const requestReconcile = (): void => {
      void reconcileStorageRuntime().catch((error) => {
        reporter.reportError(error instanceof Error ? error : new Error('storage reconcile failed'));
      });
    };

    const useFs = async (fsName: string): Promise<void> => {
      const info = registeredFileSystems.value[fsName];
      if (!info) {
        return;
      }

      const isChangingFs = currentFsName.value !== fsName;

      if (isChangingFs) {
        resetMountedState();
        settings.settings.vault = undefined;
      }

      currentFsName.value = fsName;

      if (isChangingFs) {
        await resetStorageBoundState();
      }

      await reconcileStorageRuntime();
    };

    watch(
      () => [currentFsInfo.value?.name, settings.settings.vault] as const,
      requestReconcile,
      { immediate: true },
    );

    return {
      register,
      currentFs,
      fileSystems,
      currentFsName,
      currentFsInfo,
      fsMounted,
      isReconciling,
      useFs,
    };
  },
  {
    persist: {
      pick: ['currentFsName'],
    },
  },
);

export const useFileSystemRootConfigurator = () => {
  const fsManager = useFileSystemManagerStore();
  const settings = useSettingsStore();

  const reconfigureCurrentFs = async (): Promise<void> => {
    const root = await fsManager.currentFs?.pickFolder?.();
    if (root === undefined) {
      return;
    }

    settings.settings.vault = root;
    await resetStorageBoundState();
    await fsManager.useFs(fsManager.currentFsName);
  };

  return { reconfigureCurrentFs };
};
