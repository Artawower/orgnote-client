import { watch, type WatchStopHandle, type Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import { to } from 'orgnote-api/utils';
import { runPostActivationSync } from './post-activation-sync';

type User = { active?: string } | null | undefined;

const isActiveUser = (user: User): boolean => !!user?.active;

export interface UseAutoSyncDeps {
  userRef: Ref<User>;
  sync: () => Promise<void>;
  onError: (error: unknown) => void;
}

const getDefaultDeps = (): UseAutoSyncDeps => {
  const authStore = api.core.useAuth();
  const { user } = storeToRefs(authStore);

  return {
    userRef: user as Ref<User>,
    sync: runPostActivationSync,
    onError: reporter.reportWarning,
  };
};

export const useAutoSync = (deps?: UseAutoSyncDeps): WatchStopHandle => {
  const { userRef, sync, onError } = deps ?? getDefaultDeps();

  return watch(
    () => userRef.value,
    async (currUser, prevUser) => {
      const becameActive = !isActiveUser(prevUser) && isActiveUser(currUser);

      if (!becameActive) return;

      const result = await to(sync)();
      if (result.isErr()) {
        onError(result.error);
      }
    },
  );
};
