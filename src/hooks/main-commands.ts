import { useCommandsStore } from 'src/stores';

import {
  getCompletionCommands,
  getGlobalCommands,
  getRoutesCommands,
} from './commands';
import { getSettingsCommands } from './commands/settings-commands';

export function useCommands() {
  const commandsStore = useCommandsStore();
  const routesCommands = getRoutesCommands();
  const settingsCommands = getSettingsCommands();
  const globalCommands = getGlobalCommands();
  const completionCommands = getCompletionCommands();

  const register = () => {
    commandsStore.register(
      ...routesCommands,
      ...settingsCommands,
      ...globalCommands,
      ...completionCommands
    );
  };

  return {
    register,
  };
}
