import { defineBoot } from '@quasar/app-vite/wrappers';
import { api } from './api';
import { useAutoSync } from 'src/composables/use-auto-sync';
import { runPostActivationSync } from 'src/composables/post-activation-sync';
import { useAppResume } from 'src/composables/use-app-resume';
import { bootTimer } from 'src/boot/perf-timer';

const hasActiveSession = (active?: string): boolean => Boolean(active);

export const shouldSyncPersistedActiveUser = (
  activeBeforeVerify?: string,
  activeAfterVerify?: string,
): boolean => hasActiveSession(activeBeforeVerify) && hasActiveSession(activeAfterVerify);

export default defineBoot(async () => {
  const authStore = api.core.useAuth();
  const activeBeforeVerify = authStore.user?.active;

  useAutoSync();
  useAppResume(() => api.core.useSync().sync());

  await bootTimer.measure('auth-verify-user', () => authStore.verifyUser());

  if (
    shouldSyncPersistedActiveUser(activeBeforeVerify, authStore.user?.active) &&
    navigator.onLine
  ) {
    await runPostActivationSync();
  }
});
