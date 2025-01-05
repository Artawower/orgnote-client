import { defineBoot } from '@quasar/app-vite/wrappers';
import type { OrgNoteApi } from 'orgnote-api';
import {
  ORGNOTE_API_PROVIDER_TOKEN,
  REPOSITORIES_PROVIDER_TOKEN,
} from 'src/constants/app-providers';
import { initRepositories } from 'src/infrastructure/repositories';
import { useCommandsGroupStore } from 'src/stores/command-group-store';
import { useCommandsStore } from 'src/stores/command-store';
import { useExtensionsStore } from 'src/stores/extension-store';
import { provide } from 'vue';

const repositories = await initRepositories();

const api: OrgNoteApi = {
  infrastructure: {
    ...repositories,
  },
  core: {
    useCommands: useCommandsStore,
    useCommandsGroup: useCommandsGroupStore,
    useExtenions: useExtensionsStore,
  },
};

export default defineBoot(({ app, store }) => {
  store.use(() => ({ api: api as OrgNoteApi }));
  app.provide(ORGNOTE_API_PROVIDER_TOKEN, api);
  app.provide(REPOSITORIES_PROVIDER_TOKEN, repositories);
});

export { api, repositories };
