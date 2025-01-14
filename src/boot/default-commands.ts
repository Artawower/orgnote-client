import { defineBoot } from '@quasar/app-vite/wrappers';
import { getGlobalCommands } from 'src/commands/global-commands';
import { getRoutesCommands } from 'src/commands/router-commands';
import { getSettingsommands as getSettingsCommands } from 'src/commands/settings-commands';
import { useCommandsStore } from 'src/stores/command';

export default defineBoot(async ({ router, app }) => {
  const routeCommands = getRoutesCommands(router);
  const commandsStore = useCommandsStore();
  const globalCommands = getGlobalCommands();
  const settingsCommands = getSettingsCommands(app);
  commandsStore.add(...routeCommands, ...globalCommands, ...settingsCommands);
});
