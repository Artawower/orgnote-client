import { defineBoot } from '@quasar/app-vite/wrappers';
import { api } from './api';
import { useAutoSync } from 'src/composables/use-auto-sync';
import { useAppResume } from 'src/composables/use-app-resume';

export default defineBoot(async () => {
  useAutoSync();
  useAppResume(() => api.core.useSync().sync());
  await api.core.useAuth().verifyUser();
});
