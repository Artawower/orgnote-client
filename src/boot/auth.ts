import { defineBoot } from '@quasar/app-vite/wrappers';
import { api } from './api';
import { useAutoSync } from 'src/composables/use-auto-sync';
import { runPostActivationSync } from 'src/composables/post-activation-sync';
import { useAppResume } from 'src/composables/use-app-resume';
import { bootTimer } from 'src/boot/perf-timer';
import { reporter } from 'src/boot/report';

const hasActiveSession = (active?: string): boolean => Boolean(active);

export const shouldSyncPersistedActiveUser = (
  activeBeforeVerify?: string,
  activeAfterVerify?: string,
): boolean => hasActiveSession(activeBeforeVerify) && hasActiveSession(activeAfterVerify);

type AuthStore = ReturnType<typeof api.core.useAuth>;

const runAuthStartup = async (
  authStore: AuthStore,
  activeBeforeVerify?: string,
): Promise<void> => {
  await bootTimer.measure('auth-verify-user', () => authStore.verifyUser());

  if (!navigator.onLine) return;
  if (!shouldSyncPersistedActiveUser(activeBeforeVerify, authStore.user?.active)) return;
  await runPostActivationSync();
};

export default defineBoot(() => {
  const authStore = api.core.useAuth();
  const activeBeforeVerify = authStore.user?.active;

  useAutoSync();
  useAppResume(() => api.core.useSync().sync());
  void runAuthStartup(authStore, activeBeforeVerify).catch(reporter.reportWarning);
});
