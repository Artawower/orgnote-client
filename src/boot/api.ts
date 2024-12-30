import { defineBoot } from '@quasar/app-vite/wrappers';
import type { OrgNoteApi } from 'orgnote-api';
import { useCommandsGroupStore } from 'src/stores/commands-group-store';
import { useCommandsStore } from 'src/stores/commands-store';

let api: OrgNoteApi;

export default defineBoot(({ store }) => {
  console.log('✎: [line 7][api.ts<boot>] store: ', store);

  api = {
    core: {
      useCommands: useCommandsStore,
      useCommandsGroup: useCommandsGroupStore,
    },
  };
});

export { api };
