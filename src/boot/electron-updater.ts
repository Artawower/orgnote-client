import type { ElectronUpdateInfo, ElectronUpdateStatus } from '../../src-electron/electron-updater-channels';
import type { ElectronUpdatesAPI } from 'src/types/global';
import { defineBoot } from '@quasar/app-vite/wrappers';
import { Platform } from 'quasar';
import { to } from 'orgnote-api/utils';
import { electronUpdateI18n } from 'src/constants/electron-update-i18n';
import { api } from './api';
import { i18n } from './i18n';
import { logger } from './logger';
import { reporter } from './report';

const ELECTRON_UPDATE_NOTIFICATION_ID = 'electron-update-downloaded';

const translate = (key: string, values?: Record<string, unknown>): string => i18n.global.t(key, values ?? {});

const createUpdateDescription = (update: ElectronUpdateInfo): string => {
  if (!update.version) return translate(electronUpdateI18n.restartToInstall);
  return translate(electronUpdateI18n.versionReady, { version: update.version });
};

const installDownloadedUpdate = async (updates: ElectronUpdatesAPI): Promise<void> => {
  const result = await to(updates.installDownloadedUpdate)();
  if (result.isErr()) {
    reporter.reportWarning(new Error(translate(electronUpdateI18n.installFailed), { cause: result.error }));
  }
};

const notifyDownloadedUpdate = (updates: ElectronUpdatesAPI, update: ElectronUpdateInfo): void => {
  api.core.useNotifications().notify({
    id: ELECTRON_UPDATE_NOTIFICATION_ID,
    message: translate(electronUpdateI18n.ready),
    description: createUpdateDescription(update),
    level: 'info',
    timeout: 0,
    stored: true,
    icon: 'sym_o_system_update',
    onClick: () => {
      void installDownloadedUpdate(updates);
    },
  });
};

const reportUpdateError = (status: Extract<ElectronUpdateStatus, { type: 'error' }>): void => {
  if (status.isBackground) {
    logger.warn('Background Electron update check failed', { message: status.message });
    return;
  }

  reporter.reportWarning(new Error(translate(electronUpdateI18n.failed, { message: status.message })));
};

const handleUpdateStatus = (updates: ElectronUpdatesAPI, status: ElectronUpdateStatus): void => {
  if (status.type === 'downloaded') {
    notifyDownloadedUpdate(updates, status);
    return;
  }

  if (status.type === 'error') {
    reportUpdateError(status);
  }
};

const requestUpdateCheck = async (updates: ElectronUpdatesAPI): Promise<void> => {
  const result = await to(updates.checkForUpdates)({ isBackground: true });
  if (result.isErr()) {
    logger.warn('Failed to request Electron update check', { error: result.error });
  }
};

export default defineBoot(() => {
  const updates = window.electron?.updates;
  if (!Platform.is.electron || !updates) return;

  updates.onStatus((status) => handleUpdateStatus(updates, status));
  void requestUpdateCheck(updates);
});
