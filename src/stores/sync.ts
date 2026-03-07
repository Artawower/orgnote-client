import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SyncStore, SyncPlan, SyncStateData, FileSystem } from 'orgnote-api';
import {
  createPlan,
  fetchRemoteChanges,
  scanLocalFiles,
  findDeletedLocally,
  recoverState,
  getOldestSyncedAt,
} from 'orgnote-api';
import { reporter } from 'src/boot/report';
import { sdk } from 'src/boot/axios';
import { createSyncState } from 'src/utils/sync-state';
import { to } from 'orgnote-api/utils';
import { enqueuePlanOperations, isPlanEmpty } from 'src/infrastructure/sync';
import { useFileSystemManagerStore } from './file-system-manager';
import { api } from 'src/boot/api';

const httpUpgradeRequired = 426;

export const useSyncStore = defineStore<'sync', SyncStore>(
  'sync',
  (): SyncStore => {
    const currentPlan = ref<SyncPlan | null>(null);
    const stateData = ref<SyncStateData | null>({ files: {} });
    const isVersionIncompatible = ref(false);

    const state = createSyncState(stateData);
    const fs = computed(() => useFileSystemManagerStore().currentFs as FileSystem);

    const isSyncProhibited = (): boolean => {
      const authStore = api.core.useAuth();
      const configStore = api.core.useConfig();
      return (
        isVersionIncompatible.value ||
        !authStore.user?.active ||
        configStore.config.synchronization.type === 'none'
      );
    };

    const buildSyncPlan = async (
      fs: FileSystem,
    ): Promise<{ plan: SyncPlan; serverTime: string }> => {
      const stateSnapshot = await state.get();
      const since = getOldestSyncedAt(stateSnapshot);
      const { files: remoteFiles, serverTime } = await fetchRemoteChanges(sdk.sync, since);
      const localFiles = await scanLocalFiles(fs, '/');
      const deletedLocally = findDeletedLocally(localFiles, stateSnapshot);

      const plan = createPlan({
        localFiles,
        deletedLocally,
        remoteFiles,
        stateData: stateSnapshot,
        serverTime,
      });

      return { plan, serverTime };
    };

    const isVersionError = (error: Error): boolean => {
      const axiosError = error as { response?: { status?: number } };
      return axiosError.response?.status === httpUpgradeRequired;
    };

    const handleSyncError = (error: Error): null => {
      if (isVersionError(error)) {
        isVersionIncompatible.value = true;
        return null;
      }
      reporter.reportError(error);
      return null;
    };

    const createPlanAction = async (): Promise<SyncPlan | null> => {
      const recoverResult = await to(recoverState)(state);
      if (recoverResult.isErr()) return handleSyncError(recoverResult.error);

      const planResult = await to(buildSyncPlan)(fs.value);
      if (planResult.isErr()) return handleSyncError(planResult.error);

      const { plan } = planResult.value;
      currentPlan.value = plan;
      return plan;
    };

    const executePlan = async (plan: SyncPlan): Promise<void> => {
      enqueuePlanOperations(plan);
      currentPlan.value = null;
    };

    const sync = async (): Promise<void> => {
      if (isSyncProhibited()) {
        return;
      }

      const plan = await createPlanAction();

      if (!plan) {
        return;
      }

      if (isPlanEmpty(plan)) {
        return;
      }

      await executePlan(plan);
    };

    const reset = async (): Promise<void> => {
      await state.clear();
      currentPlan.value = null;
    };

    return {
      currentPlan,
      stateData,
      createPlan: createPlanAction,
      executePlan,
      sync,
      reset,
    };
  },
  {
    persist: {
      pick: ['stateData'],
    },
  },
);
