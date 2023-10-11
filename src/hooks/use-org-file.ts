import axios from 'axios';

import { onBeforeMount, ref } from 'vue';

export const useOrgFile = (orgFilePath: string) => {
  const loading = ref<boolean>(true);
  const noteContent = ref<string | null>(null);

  const loadOrgFile = async () => {
    try {
      const rspns = await axios.get(orgFilePath);
      noteContent.value = rspns.data;
    } finally {
      loading.value = false;
    }
  };

  onBeforeMount(async () => {
    await loadOrgFile();
  });

  return {
    loading,
    noteContent,
  };
};
