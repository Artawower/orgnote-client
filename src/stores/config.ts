import { ORGNOTE_SYSTEM_ROOT_PATH, type OrgNoteConfig, type ConfigStore } from 'orgnote-api';
import { defineStore, storeToRefs } from 'pinia';
import { DEFAULT_CONFIG, DEFAULT_CONFIG_CONTENT } from 'src/constants/config';
import { computed, reactive, ref, watch } from 'vue';
import clone from 'rfdc';
import { useFileSystemStore } from './file-system';
import { debounce } from 'src/utils/debounce';
import { useSettingsStore } from './settings';
import { useFileSystemManagerStore } from './file-system-manager';
import { to } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import type { Result } from 'neverthrow';
import { stringifyToml } from 'orgnote-api/utils';
import { toAbsolutePath, type FileSystemChange } from 'orgnote-api';
import { useFileWatcherStore } from './file-watcher';
import { ORGNOTE_CONFIG_FILE_PATH } from 'src/constants/system-file-paths';
import { withDeferredFlagReset, withFlag } from 'src/utils/with-flag';
import { getNextBrokenConfigIndex } from 'src/utils/get-next-broken-config-index';
import {
  InvalidOrgNoteConfigSchemaError,
  parseOrgNoteConfigToml,
} from 'src/utils/parse-orgnote-config-toml';

export const useConfigStore = defineStore<'config', ConfigStore>('config', () => {
  const fileSystem = useFileSystemStore();
  const diskConfigPath = ORGNOTE_CONFIG_FILE_PATH;
  const diskConfigWatchPath = toAbsolutePath(diskConfigPath);
  const configSystemDir = ORGNOTE_SYSTEM_ROOT_PATH;
  const lastSyncedMtime = ref<number>(0);
  const isInitialized = ref(false);
  const isApplyingDiskConfig = ref(false);
  const isSavingDiskConfig = ref(false);
  const { settings } = storeToRefs(useSettingsStore());
  const vault = computed(() => settings.value.vault);

  const config = reactive<OrgNoteConfig>(clone()(DEFAULT_CONFIG));

  const configErrors = ref<string[]>([]);

  const { currentFsInfo, currentFs } = storeToRefs(useFileSystemManagerStore());

  const isVaultRequired = computed(() => Boolean(currentFs.value?.pickFolder));

  const isReadyForDiskSync = computed(() => {
    if (!currentFsInfo.value) {
      return false;
    }
    if (!isVaultRequired.value) {
      return true;
    }
    return !!vault.value;
  });

  const getConfigFileMtime = async (): Promise<number> => {
    const safeInfo = to(fileSystem.fileInfo, 'Failed to read config.toml metadata');
    const res = await safeInfo(diskConfigPath);
    if (res.isErr()) {
      reporter.reportError(res.error);
      return 0;
    }
    return res.value?.mtime ?? 0;
  };

  const writeDiskConfigContent = async (content: string): Promise<void> => {
    const safeWrite = to(fileSystem.writeFile, 'Failed to write config.toml');
    const writeResult = await safeWrite(diskConfigPath, content);
    if (writeResult.isErr()) {
      reporter.reportError(writeResult.error);
      return;
    }

    lastSyncedMtime.value = await getConfigFileMtime();
  };

  const ensureConfigFileExists = async (): Promise<void> => {
    const mtime = await getConfigFileMtime();
    if (mtime > 0) {
      lastSyncedMtime.value = mtime;
      return;
    }

    await withFlag(isSavingDiskConfig, async () => {
      await writeDiskConfigContent(DEFAULT_CONFIG_CONTENT);
    });
  };

  const applyDefaultConfig = (): void => {
    withDeferredFlagReset(isApplyingDiskConfig, () => {
      Object.assign(config, clone()(DEFAULT_CONFIG));
    });
  };

  const applyConfigFromDisk = (rawConfigContent: string): Result<void, Error> => {
    configErrors.value = [];
    return withDeferredFlagReset(isApplyingDiskConfig, () =>
      parseOrgNoteConfigToml(rawConfigContent)
        .map((validated) => {
          Object.assign(config, validated);
        })
        .mapErr((error) => {
          configErrors.value =
            error instanceof InvalidOrgNoteConfigSchemaError ? [...error.errors] : [];
          return error;
        }),
    );
  };

  const getNextBrokenConfigPath = async (): Promise<string> => {
    const safeReadDir = to(fileSystem.readDir, 'Failed to list system files directory');
    const res = await safeReadDir(configSystemDir);
    const files = res.isOk() ? res.value : [];
    const index = getNextBrokenConfigIndex(files);
    return `${configSystemDir}/config-broken-${index}.toml`;
  };

  const resetDiskConfigToDefault = async (): Promise<void> => {
    await writeDiskConfigContent(DEFAULT_CONFIG_CONTENT);
  };

  const quarantineBrokenConfig = async (cause: Error, rawContent: string): Promise<void> => {
    const brokenPath = await getNextBrokenConfigPath();
    const safeRename = to(fileSystem.rename, 'Failed to move broken config.toml');
    const safeWrite = to(fileSystem.writeFile, 'Failed to persist broken config content');

    const persistBrokenCopy = async (): Promise<void> => {
      const persistResult = await safeWrite(brokenPath, rawContent);
      if (persistResult.isOk()) {
        return;
      }
      reporter.reportError(persistResult.error);
    };

    applyDefaultConfig();

    await withFlag(isSavingDiskConfig, async () => {
      const moveResult = await safeRename(diskConfigPath, brokenPath);
      if (moveResult.isErr()) {
        await persistBrokenCopy();
      }

      await resetDiskConfigToDefault();
    });

    reporter.reportError(
      new Error(`Invalid config.toml was moved to ${brokenPath} and reset to defaults`, {
        cause,
      }),
    );
  };

  const loadFromDisk = async (force = false): Promise<void> => {
    configErrors.value = [];

    const mtime = await getConfigFileMtime();
    if (!force && mtime <= lastSyncedMtime.value) {
      return;
    }

    const safeRead = to(fileSystem.readFile, 'Failed to read config.toml');
    const readResult = await safeRead(diskConfigPath, 'utf8');
    if (readResult.isErr()) {
      reporter.reportError(readResult.error);
      return;
    }

    const content = readResult.value;
    if (!content) {
      return;
    }

    const result = applyConfigFromDisk(content);
    if (result.isErr()) {
      await quarantineBrokenConfig(result.error, content);
      lastSyncedMtime.value = await getConfigFileMtime();
      return;
    }

    lastSyncedMtime.value = mtime;
  };

  const saveToDisk = async (): Promise<void> => {
    await withFlag(isSavingDiskConfig, async () => {
      await writeDiskConfigContent(stringifyToml(config));
    });
  };

  const saveToDiskDebounced = debounce(saveToDisk, 1000);

  let stopDiskConfigWatch: (() => void) | null = null;

  const shouldIgnoreDiskChange = (change: FileSystemChange): boolean => {
    if (isSavingDiskConfig.value) {
      return true;
    }

    if (change.type === 'delete') {
      return true;
    }

    if (typeof change.mtime !== 'number') {
      return false;
    }

    return change.mtime <= lastSyncedMtime.value;
  };

  const onDiskConfigChange = (change: FileSystemChange): void => {
    if (change.type === 'delete') {
      applyDefaultConfig();
      void ensureConfigFileExists();
      return;
    }

    if (shouldIgnoreDiskChange(change)) {
      return;
    }
    void loadFromDisk(true);
  };

  const startDiskConfigWatch = (): void => {
    if (stopDiskConfigWatch) {
      return;
    }

    const fileWatcher = useFileWatcherStore();
    stopDiskConfigWatch = fileWatcher.watch(diskConfigWatchPath, onDiskConfigChange);
  };

  const sync = async (): Promise<void> => {
    if (isInitialized.value) {
      return;
    }

    if (!isReadyForDiskSync.value) {
      return;
    }

    await ensureConfigFileExists();
    await loadFromDisk(true);
    startDiskConfigWatch();
    isInitialized.value = true;
  };

  watch(
    [vault, currentFsInfo],
    async () => {
      if (!isReadyForDiskSync.value) {
        return;
      }

      if (!isInitialized.value) {
        await sync();
        return;
      }

      stopDiskConfigWatch?.();
      stopDiskConfigWatch = null;
      lastSyncedMtime.value = 0;
      await ensureConfigFileExists();
      await loadFromDisk(true);
      startDiskConfigWatch();
    },
    { deep: false },
  );

  watch(
    config,
    () => {
      if (!isInitialized.value) {
        return;
      }

      if (isApplyingDiskConfig.value) {
        return;
      }

      saveToDiskDebounced();
    },
    { deep: true, flush: 'post' },
  );

  return {
    config,
    sync,
    configErrors,
  };
});
