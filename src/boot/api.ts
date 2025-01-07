import { defineBoot } from '@quasar/app-vite/wrappers';
import type { OrgNoteApi } from 'orgnote-api';
import {
  ORGNOTE_API_PROVIDER_TOKEN,
  REPOSITORIES_PROVIDER_TOKEN,
} from 'src/constants/app-providers';
import { initRepositories } from 'src/infrastructure/repositories';
import { useCommandsGroupStore } from 'src/stores/command-group';
import { useCommandsStore } from 'src/stores/command';
import { useExtensionsStore } from 'src/stores/extension';
import { useFileSystemStore } from 'src/stores/file-system';
import {
  mobileOnly,
  clientOnly,
  androidOnly,
  serverOnly,
  desktopOnly,
} from 'src/utils/platform-specific';
import { useEncryptionStore } from 'src/stores/encryption';
import { sleep } from 'src/utils/sleep';

const repositories = await initRepositories();

const api: OrgNoteApi = {
  infrastructure: {
    ...repositories,
  },
  core: {
    useCommands: useCommandsStore,
    useCommandsGroup: useCommandsGroupStore,
    useExtenions: useExtensionsStore,
    useFileSystem: useFileSystemStore,
    useEncryption: useEncryptionStore,
  },
  utils: {
    mobileOnly,
    clientOnly,
    androidOnly,
    serverOnly,
    desktopOnly,
  },
};

export default defineBoot(async ({ app, store }) => {
  await sleep(5000);
  store.use(() => ({ api: api as OrgNoteApi }));
  app.provide(ORGNOTE_API_PROVIDER_TOKEN, api);
  app.provide(REPOSITORIES_PROVIDER_TOKEN, repositories);
});

export { api, repositories };
