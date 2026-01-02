import type { Command } from 'orgnote-api';
import { DefaultCommands } from 'orgnote-api';
import { useFileSearchStore } from 'src/stores/file-search';

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
];
