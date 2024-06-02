import { ModelsOrgNoteClientUpdateInfo } from 'orgnote-api/remote-api';
import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { ref, watch } from 'vue';
import { version } from '../../package.json';
import { useOrgNoteApiStore } from './orgnote-api.store';
import NewReleaseInfo from 'src/components/containers/NewReleaseInfo.vue';
import { mockServer } from 'src/tools';

export const useSystemInfoStore = defineStore('system-info', () => {
  const newReleaseInfo = ref<ModelsOrgNoteClientUpdateInfo>(null);
  const newFilesAvailable = ref<boolean>(false);

  const { orgNoteApi } = useOrgNoteApiStore();

  const loadNewReleaseInfo = async () => {
    const response = await sdk.system.systemInfoClientUpdateVersionGet(version);
    newReleaseInfo.value = response.data;
  };

  watch([newReleaseInfo, newFilesAvailable], () => {
    checkUpdate();
  });

  watch(newFilesAvailable, () => {
    loadNewReleaseInfo();
  });

  const checkUpdate = () => {
    if (!newReleaseInfo.value || !newFilesAvailable.value) {
      return;
    }

    orgNoteApi.ui.openModal({
      component: NewReleaseInfo,
    });
  };

  return {
    loadNewReleaseInfo: mockServer(loadNewReleaseInfo),
    newReleaseInfo,
    newFilesAvailable,
  };
});
