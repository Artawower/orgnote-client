import { defineBoot } from '@quasar/app-vite/wrappers';
import type { OrgNoteApi } from 'orgnote-api';
import { initRepositories } from 'src/infrastructure/repositories';
import { useCommandsGroupStore } from 'src/stores/command-group-store';
import { useCommandsStore } from 'src/stores/command-store';
import { useExtensionsStore } from 'src/stores/extension-store';

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

export default defineBoot(({ store }) => {
  store.use(() => ({ api: api as OrgNoteApi }));
});

export { api };
