import { useCommandsStore } from 'src/stores/commands';
import {
  getCompletionCommands,
  getGlobalCommands,
  getMobileDevicesCommands,
  getRoutesCommands,
} from './commands';
import { getSettingsCommands } from './commands/settings-commands';

export function useCommands() {
  const commandsStore = useCommandsStore();
  const routesCommands = getRoutesCommands();
  const settingsCommands = getSettingsCommands();
  const globalCommands = getGlobalCommands();
  const completionCommands = getCompletionCommands();
  const mobileDevicesCommands = getMobileDevicesCommands();
  console.log(
    '✎: [line 17][MOBILE COMMANDS] getMobileDevicesCommands,mobileDevicesCommands: ',
    mobileDevicesCommands
  );

  const register = () => {
    commandsStore.register(
      ...routesCommands,
      ...settingsCommands,
      ...globalCommands,
      ...completionCommands,
      ...mobileDevicesCommands
    );
  };

  return {
    register,
  };
}
