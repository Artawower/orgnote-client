import { ORG_NOTE_CONFIG_SCHEMA, type OrgNoteConfig, type ConfigStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { DEFAULT_CONFIG } from 'src/constants/config';
import { reactive, ref, watch } from 'vue';
import clone from 'rfdc';
import { useFileSystemStore } from './file-system';
import { parse } from 'valibot';
import { formatValidationErrors } from 'src/utils/format-validation-errors';
import { getSystemFilesPath } from 'src/utils/get-sytem-files-path';
import { debounce } from 'src/utils/debounce';
import { useSettingsStore } from './settings';
import { useFileSystemManagerStore } from './file-system-manager';

export const useConfigStore = defineStore<'config', ConfigStore>(
  'config',
  () => {
    const fileSystem = useFileSystemStore();
    const diskConfigPath = getSystemFilesPath('config.json');
    const lastSyncTime = ref<number>(0);
    const settingsStore = useSettingsStore();

    const config = reactive<OrgNoteConfig>(clone()(DEFAULT_CONFIG));

    const configErrors = ref<string[]>([]);

    const sync = async () => {
      configErrors.value = [];

      const content = JSON.stringify(config);
      const newConfig = await fileSystem.syncFile(diskConfigPath, content, lastSyncTime.value);

      if (!newConfig) {
        return;
      }
      const parsedConfig: OrgNoteConfig = JSON.parse(newConfig);

      try {
        parse(ORG_NOTE_CONFIG_SCHEMA, parsedConfig);
        const clonedConfig = clone()(parsedConfig);
        Object.assign(config, clonedConfig);
      } catch (e) {
        console.log('✎: [line 41][ANDROID FS] e: ', e);
        const errorMsg = formatValidationErrors(e as Error);
        configErrors.value = errorMsg;
      }
    };

    const syncWithDebounce = debounce(sync, 1000);

    const fsManager = useFileSystemManagerStore();

    watch(
      [settingsStore.settings.vault, config, fsManager.currentFsInfo],
      async () => {
        await syncWithDebounce();
      },
      { deep: true },
    );

    return {
      config,
      sync,
      configErrors,
    };
  },
  { persist: true },
);
