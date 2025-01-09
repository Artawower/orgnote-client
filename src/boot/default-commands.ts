import { defineBoot } from '@quasar/app-vite/wrappers';
import { getRoutesCommands } from 'src/commands/router-commands';
import { useCommandsStore } from 'src/stores/command';

export default defineBoot(async ({ router }) => {
  const routeCommands = getRoutesCommands(router);
  const commandsStore = useCommandsStore();
  commandsStore.add(...routeCommands);
});
