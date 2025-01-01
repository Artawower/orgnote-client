import { defineBoot } from '@quasar/app-vite/wrappers';
import type { OrgNoteApi } from 'orgnote-api';
import { useCommandsGroupStore } from 'src/stores/command-group-store';
import { useCommandsStore } from 'src/stores/command-store';
import { useExtensionsStore } from 'src/stores/extension-store';

const api: OrgNoteApi = {
  core: {
    useCommands: useCommandsStore,
    useCommandsGroup: useCommandsGroupStore,
    useExtenions: useExtensionsStore,
  },
};

export default defineBoot(({ store }) => {
  store.use(() => ({ api }));
});

export { api };
