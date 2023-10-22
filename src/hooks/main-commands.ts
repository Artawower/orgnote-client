import { Command, CommandHandlerParams } from 'src/models';
import {
  useCommandsStore,
  useCompletionStore,
  useSearchStore,
} from 'src/stores';
import { useKeybindingStore } from 'src/stores/keybindings';
import { useSettingsStore } from 'src/stores/settings';
import { camelCaseToWords } from 'src/tools';
import { useRouter } from 'vue-router';

export enum COMMAND {
  openSearch = 'openSearch',
  restoreLastCompletionSession = 'restoreLastCompletionSession',
  toggleExecuteCommand = 'toggleExecuteCommand',
}
export function useMainCommands() {
  const { executeCommand } = useKeybindingStore();

  const completionStore = useCompletionStore();
  const searchStore = useSearchStore();
  const commandsStore = useCommandsStore();

  const routesCommands = getRoutesCommands();
  const settingsCommands = getSettingsCommands();

  const keybindingCommands: Command[] = [
    {
      command: COMMAND.toggleExecuteCommand,
      keySequence: 'Alt+KeyX',
      description: 'Toggle command executor',
      group: 'completion',
      allowOnInput: true,
      handler: (params?: CommandHandlerParams) => {
        completionStore.toggleCompletion();
        commandsStore.initCompletion();
        params?.event?.preventDefault();
      },
    },
    {
      command: COMMAND.openSearch,
      keySequence: '/',
      description: 'search notes',
      group: 'search',
      handler: (params) => {
        searchStore.initCompletion();
        params.event?.preventDefault();
      },
    },
    {
      command: COMMAND.restoreLastCompletionSession,
      keySequence: "'",
      description: ' Restore last completion session',
      group: 'search',
      handler: () => {
        completionStore.restoreLastCompletionSession();
      },
    },
  ];

  const dynamicKeybindings: Command[] = [
    {
      handler: () => {
        completionStore.closeCompletion();
      },
      command: 'exitCommandExecutor',
      keySequence: 'Escape',
      description: 'Exit command executor',
      group: 'completion',
      allowOnInput: true,
    },
    {
      handler: () => {
        completionStore.nextCandidate();
      },
      command: 'nextCandidate',
      keySequence: 'Control+KeyJ',
      description: 'Next candidate',
      group: 'completion',
      allowOnInput: true,
    },
    {
      handler: () => {
        completionStore.previousCandidate();
      },
      command: 'previousCandidate',
      keySequence: 'Control+KeyK',
      description: 'Previous candidate',
      group: 'completion',
      allowOnInput: true,
    },
    {
      command: 'executeCandidate',
      keySequence: 'Enter',
      description: 'Execute candidate',
      group: 'completion',
      allowOnInput: true,
      ignorePrompt: true,
      handler: () => {
        if (!completionStore.opened) {
          return;
        }
        completionStore.closeCompletion();
        executeCommand(completionStore.selectedCandidate);
      },
    },
  ];

  const register = () => {
    commandsStore.register(
      ...routesCommands,
      ...settingsCommands,
      ...keybindingCommands,
      ...dynamicKeybindings
    );
  };

  return {
    register,
  };
}

function getRoutesCommands(): Command[] {
  const router = useRouter();
  const routesCommands: Command[] = router
    .getRoutes()
    // TODO: master tmp hack for avoid routes with params. Adapt to user input.
    .filter(
      (r) =>
        r.name &&
        !r.path.includes(':') &&
        r?.meta?.programmaticalNavigation !== false
    )
    .map((r) => ({
      command: camelCaseToWords(r.name.toString()),
      description: `Open ${r.name.toString()}`,
      group: 'navigation',
      icon: 'assistant_navigation',
      handler: () => router.push({ name: r.name }),
    }));
  return routesCommands;
}

// TODO: master right now this works only for boolean settings
function getSettingsCommands(): Command[] {
  const { config } = useSettingsStore();
  const settingsCommands = getNestedConfigCommands(config);
  return settingsCommands;
}

function getNestedConfigCommands(config: Record<string, unknown>): Command[] {
  return Object.keys(config).reduce<Command[]>((acc, key) => {
    const value = config[key];
    if (typeof value === 'boolean') {
      acc.push({
        command: camelCaseToWords(key),
        description: `Toggle ${key}`,
        group: 'settings',
        icon: 'settings',
        handler: () => {
          config[key] = !config[key];
        },
      });
    } else if (typeof value === 'object') {
      acc.push(...getNestedConfigCommands(value as Record<string, unknown>));
    }
    return acc;
  }, []);
}
