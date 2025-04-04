import type { OrgNoteSettings } from 'orgnote-api';
import { type SettingsStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import type { ModelsAPIToken } from 'orgnote-api/remote-api';

export const useSettingsStore = defineStore<'settings', SettingsStore>(
  'settings',
  () => {
    const tokens = ref<ModelsAPIToken[]>([]);

    const settings = reactive<OrgNoteSettings>({});

    return {
      settings,
      tokens,
    };
  },
  {
    persist: true,
  },
);
