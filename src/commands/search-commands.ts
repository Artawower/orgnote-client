import type { Command, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands } from 'orgnote-api';
import { useFileSearchStore } from 'src/stores/file-search';
import { useNoteSearchCompletion } from 'src/composables/note-search-completion';

export const getSearchCommands = (): Command[] => [
  {
    command: DefaultCommands.INIT_SEARCH_INDEX,
    group: 'system',
    system: true,
    handler: async () => {
      const fileSearch = useFileSearchStore();
      await fileSearch.loadIndex();
      await fileSearch.indexFiles();
    },
  },
  {
    command: DefaultCommands.SEARCH,
    group: 'search',
    icon: 'sym_o_search',
    handler: async (api: OrgNoteApi) => {
      await useNoteSearchCompletion(api);
    },
  },
];
