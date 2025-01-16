import { ORG_NOTE_CONFIG_SCHEMA, type OrgNoteConfig, type SettingsStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { DEFAULT_CONFIG } from 'src/constants/config';
import { reactive, ref } from 'vue';
import clone from 'rfdc';
import { useFileSystemStore } from './file-system';
import { parse } from 'valibot';
import { formatValidationErrors } from 'src/utils/format-validation-errors';
import { getSystemFilesPath } from 'src/utils/get-sytem-files-path';
import type { ModelsAPIToken } from 'orgnote-api/remote-api';

export const useSettingsStore = defineStore<'settings', SettingsStore>(
  'settings',
  () => {
    const fileSystem = useFileSystemStore();
    const diskConfigPath = getSystemFilesPath('config.json');
    const lastSyncTime = ref<number>(0);

    const tokens = ref<ModelsAPIToken[]>([]);

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
        const errorMsg = formatValidationErrors(e as Error);
        configErrors.value = errorMsg;
      }
    };

    return {
      config,
      sync,
      configErrors,
      tokens,
    };
  },
  { persist: true },
);
