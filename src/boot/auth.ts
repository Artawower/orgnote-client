import { defineBoot } from '@quasar/app-vite/wrappers';
import { api } from './api';
import { useAutoSync } from 'src/composables/use-auto-sync';
import { useAppResume } from 'src/composables/use-app-resume';

const isActiveUser = (active?: string): boolean => Boolean(active);

export const shouldSyncPersistedActiveUser = (
  activeBeforeVerify?: string,
  activeAfterVerify?: string,
): boolean => isActiveUser(activeBeforeVerify) && isActiveUser(activeAfterVerify);

export default defineBoot(async () => {
  const authStore = api.core.useAuth();
  const syncStore = api.core.useSync();

  useAutoSync();
  useAppResume(() => api.core.useSync().sync());

  const activeBeforeVerify = authStore.user?.active;
  await authStore.verifyUser();

  if (shouldSyncPersistedActiveUser(activeBeforeVerify, authStore.user?.active)) {
    await syncStore.sync();
  }
});
