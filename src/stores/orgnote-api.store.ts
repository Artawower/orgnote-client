import { useOrgNoteApi } from 'src/api';
import { useRouter } from 'vue-router';

export const useOrgNoteApiStore = () => {
  const router = useRouter();
  const orgNoteApi = useOrgNoteApi({
    router,
  });

  return {
    orgNoteApi,
  };
};
