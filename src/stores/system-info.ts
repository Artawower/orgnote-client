import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { ref, watch } from 'vue';
import { version } from '../../package.json';
import { useOrgNoteApiStore } from './orgnote-api.store';
import NewReleaseInfo from 'src/components/containers/NewReleaseInfo.vue';
import { mockServer } from 'src/tools';
import { HandlersSystemInfo } from 'orgnote-api/remote-api';

export const useSystemInfoStore = defineStore('system-info', () => {
  const systemInfo = ref<HandlersSystemInfo>(null);
  const newFilesAvailable = ref<boolean>(false);
  const loading = ref<boolean>(false);

  const { orgNoteApi } = useOrgNoteApiStore();

  const loadSystemInfo = async () => {
    loading.value = true;
    try {
      const response = await sdk.system.systemInfoVersionGet(version);
      systemInfo.value = response.data;
    } finally {
      loading.value = false;
    }
  };

  watch([systemInfo, newFilesAvailable], () => {
    checkUpdate();
  });

  watch(newFilesAvailable, () => {
    loadSystemInfo();
  });

  const checkUpdate = () => {
    if (!systemInfo.value || !newFilesAvailable.value) {
      return;
    }

    orgNoteApi.ui.openModal({
      component: NewReleaseInfo,
    });
  };

  return {
    loadSystemInfo: mockServer(loadSystemInfo),
    systemInfo,
    newFilesAvailable,
    loading,
  };
});
