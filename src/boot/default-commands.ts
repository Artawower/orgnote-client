import { defineBoot } from '@quasar/app-vite/wrappers';
import { getGlobalCommands } from 'src/commands/global-commands';
import { getRoutesCommands } from 'src/commands/router-commands';
import { useCommandsStore } from 'src/stores/command';

export default defineBoot(async ({ router }) => {
  const routeCommands = getRoutesCommands(router);
  const commandsStore = useCommandsStore();
  const globalCommands = getGlobalCommands();
  commandsStore.add(...routeCommands, ...globalCommands);
});
