import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SyncStore, SyncPlan, SyncStateData, FileSystem } from 'orgnote-api';
import { createSyncPlan, I18N, InvalidSyncChangesResponseError, recoverState } from 'orgnote-api';
import { reporter } from 'src/boot/report';
import { sdk } from 'src/boot/axios';
import { createSyncState } from 'src/utils/sync-state';
import { to } from 'orgnote-api/utils';
import { enqueuePlanOperations, isPlanEmpty } from 'src/infrastructure/sync';
import { useFileSystemManagerStore } from './file-system-manager';
import { api } from 'src/boot/api';
import { withCoalescing } from 'src/utils/with-coalescing';
import axios from 'axios';
import { i18n } from 'src/boot/i18n';

const httpUpgradeRequired = 426;
const rootPath = '/';
const contentHashCheckEnabled = true;
const invalidSyncResponseNotificationId = 'sync-invalid-api-response';

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

    const isVersionError = (error: Error): boolean => {
      return axios.isAxiosError(error) && error.response?.status === httpUpgradeRequired;
    };

    const reportInvalidSyncResponse = (error: InvalidSyncChangesResponseError): null => {
      reporter.reportError(error, {
        id: invalidSyncResponseNotificationId,
        message: i18n.global.t(I18N.SYNC_INVALID_API_RESPONSE),
        stored: true,
      });
      return null;
    };

    const handleSyncError = (error: Error): null => {
      if (isVersionError(error)) {
        isVersionIncompatible.value = true;
        return null;
      }

      if (error instanceof InvalidSyncChangesResponseError) {
        return reportInvalidSyncResponse(error);
      }

      reporter.reportError(error);
      return null;
    };

    const createPlanAction = async (): Promise<SyncPlan | null> => {
      const recoverResult = await to(recoverState)(state);
      if (recoverResult.isErr()) return handleSyncError(recoverResult.error);

      const planResult = await to(createSyncPlan)({
        fs: fs.value,
        api: sdk.sync,
        state,
        rootPath: rootPath,
        enableContentHashCheck: contentHashCheckEnabled,
      });
      if (planResult.isErr()) return handleSyncError(planResult.error);

      currentPlan.value = planResult.value;
      return planResult.value;
    };

    const executePlan = async (plan: SyncPlan): Promise<void> => {
      await enqueuePlanOperations(plan);
      currentPlan.value = null;
    };

    const runSyncCycle = async (): Promise<void> => {
      if (isSyncProhibited()) return;
      const plan = await createPlanAction();
      if (!plan || isPlanEmpty(plan)) return;
      await executePlan(plan);
    };

    const sync = withCoalescing(runSyncCycle);

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
