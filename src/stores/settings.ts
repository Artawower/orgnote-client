import type { OrgNoteSettings } from 'orgnote-api';
import { type SettingsStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { computed, reactive, ref, watch } from 'vue';
import type { ModelsAPIToken } from 'orgnote-api/remote-api';
import { sdk } from 'src/boot/axios';
import { to } from 'orgnote-api/utils';
import { useAuthStore } from './auth';

export const useSettingsStore = defineStore<'settings', SettingsStore>(
  'settings',
  () => {
    const tokens = ref<ModelsAPIToken[]>([]);

    const settings = reactive<OrgNoteSettings>({});

    const onboardingCompleted = ref(false);
    const onboardingCurrentStep = ref(0);

    const auth = useAuthStore();
    const isActiveUser = computed(() => !!auth.user?.active);

    watch(isActiveUser, (active) => {
      if (active) {
        loadApiTokens();
        return;
      }
      tokens.value = [];
    });

    const loadApiTokens = async (): Promise<void> => {
      if (!isActiveUser.value) {
        tokens.value = [];
        return;
      }
      const result = await to(() => sdk.auth.authApiTokensGet())();
      if (result.isErr()) {
        return;
      }
      tokens.value = result.value.data.data ?? [];
    };

    const createApiToken = async (): Promise<void> => {
      if (!isActiveUser.value) {
        return;
      }

      const result = await to(() => sdk.auth.authTokenPost())();
      if (result.isErr()) {
        return;
      }
      const newToken = result.value.data.data;
      if (!newToken) {
        return;
      }
      tokens.value = [...tokens.value, newToken];
    };

    const removeApiToken = async (token: ModelsAPIToken): Promise<void> => {
      if (!isActiveUser.value) {
        return;
      }

      const previousTokens = tokens.value;
      tokens.value = tokens.value.filter((t) => t.id !== token.id);

      const result = await to(() => sdk.auth.authTokenTokenIdDelete(token.id!))();
      if (result.isErr()) {
        tokens.value = previousTokens;
      }
    };

    return {
      settings,
      tokens,
      onboardingCompleted,
      onboardingCurrentStep,
      loadApiTokens,
      createApiToken,
      removeApiToken,
    };
  },
  {
    persist: true,
  },
);
