import { type OrgNoteApi, type SyncProfile } from 'orgnote-api';
import { stringifyToml } from 'orgnote-api/utils';
import { getApiPublicUrl, getWebSocketUrl } from './server-endpoints';

const defaultBackupCount = 3;
const defaultProfileName = 'default';
const defaultLogPath = '/tmp/log/orgnote';
const defaultClientAddress = '';

const getClientAddress = (): string => {
  if (typeof window === 'undefined') {
    return defaultClientAddress;
  }
  return window.location.origin;
};

const buildProfileFromApi = (api: OrgNoteApi): SyncProfile => {
  const configStore = api.core.useConfig();
  const authStore = api.core.useAuth();

  return {
    name: defaultProfileName,
    clientAddress: getClientAddress(),
    wsAddress: getWebSocketUrl(),
    remoteAddress: getApiPublicUrl(configStore.config.network.apiUrl),
    token: authStore.token,
    rootFolder: '',
    debug: configStore.config.developer.developerMode,
    logPath: defaultLogPath,
    backupDir: '',
    backupCount: defaultBackupCount,
  };
};

export const buildLocalSyncProfileToml = (api: OrgNoteApi): string =>
  stringifyToml({ accounts: [buildProfileFromApi(api)] });
