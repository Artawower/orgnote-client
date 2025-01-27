import { defineBoot } from '@quasar/app-vite/wrappers';
import { getCompletionCommands } from 'src/commands/completion';
import { getGlobalCommands } from 'src/commands/global-commands';
import { getPagesCommands } from 'src/commands/pages';
import { getRoutesCommands } from 'src/commands/router-commands';
import { getSettingsommands as getSettingsCommands } from 'src/commands/settings-commands';
import { useCommandsStore } from 'src/stores/command';

export default defineBoot(async ({ router }) => {
  const routeCommands = getRoutesCommands(router);
  const commandsStore = useCommandsStore();
  const globalCommands = getGlobalCommands();
  const settingsCommands = getSettingsCommands();
  const completionCommnads = getCompletionCommands();
  const pagesCommands = getPagesCommands();

  commandsStore.add(
    ...routeCommands,
    ...globalCommands,
    ...settingsCommands,
    ...completionCommnads,
    ...pagesCommands,
  );
});
