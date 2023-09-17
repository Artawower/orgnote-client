import { Keybinding } from 'src/models';
import { useCompletionStore, useSearchStore } from 'src/stores';
import { useKeybindingStore } from 'src/stores/keybindings';
import { camelCaseToWords } from 'src/tools';
import { useRouter } from 'vue-router';

export enum COMMAND {
  openSearch = 'openSearch',
  restoreLastCompletionSession = 'restoreLastCompletionSession',
  toggleExecuteCommand = 'toggleExecuteCommand',
}
export function useCommandExecutor() {
  const { registerKeybindings, executeCommand, uregisterKeybindings } =
    useKeybindingStore();

  const completionStore = useCompletionStore();
  const keybindingStore = useKeybindingStore();
  const searchStore = useSearchStore();

  const router = useRouter();

  console.log(
    `✎: [routes][${new Date().toString()}] routes`,
    router
      .getRoutes()
      // TODO: master tmp hack for avoid routes with params. Adapt to user input.
      .filter((r) => r.name && !r.path.includes(':'))
  );

  const routesCommands: Keybinding[] = router
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
      group: 'Navigation',
      handler: () => router.push({ name: r.name }),
    }));

  const keybindingCommands: Keybinding[] = [
    {
      command: COMMAND.toggleExecuteCommand,
      keySequence: 'Alt+KeyX',
      description: 'Toggle command executor',
      group: 'Completion',
      allowOnInput: true,
      handler: () => {
        completionStore.toggleCompletion();
        keybindingStore.initCompletion();
      },
    },
    {
      command: COMMAND.openSearch,
      keySequence: '/',
      description: 'search notes',
      group: 'Search',
      handler: () => {
        completionStore.openCompletion();
        searchStore.initCompletion();
      },
    },
    {
      command: COMMAND.restoreLastCompletionSession,
      keySequence: "'",
      description: ' Restore last completion session',
      group: 'Search',
      handler: () => {
        completionStore.restoreLastCompletionSession();
      },
    },
    ...routesCommands,
  ];

  const dynamicKeybindings: Keybinding[] = [
    {
      handler: () => {
        completionStore.closeCompletion();
      },
      command: 'exitCommandExecutor',
      keySequence: 'Escape',
      description: 'Exit command executor',
      group: 'Completion',
      allowOnInput: true,
    },
    {
      handler: () => {
        completionStore.nextCandidate();
      },
      command: 'nextCandidate',
      keySequence: 'Control+KeyJ',
      description: 'Next candidate',
      group: 'Completion',
      allowOnInput: true,
    },
    {
      handler: () => {
        completionStore.previousCandidate();
      },
      command: 'previousCandidate',
      keySequence: 'Control+KeyK',
      description: 'Previous candidate',
      group: 'Completion',
      allowOnInput: true,
    },
    {
      command: 'executeCandidate',
      keySequence: 'Enter',
      description: 'Execute candidate',
      group: 'Completion',
      allowOnInput: true,
      ignorePrompt: true,
      handler: () => {
        if (!completionStore.opened) {
          return;
        }
        executeCommand(completionStore.selectedCandidate);
        completionStore.closeCompletion();
      },
    },
  ];

  const register = () => {
    registerKeybindings(keybindingCommands);
  };

  const registerDynamicCommands = () => {
    registerKeybindings(dynamicKeybindings);
  };

  const unregisterDynamicCommands = () => {
    uregisterKeybindings(dynamicKeybindings);
  };

  return {
    register,
    registerDynamicCommands,
    unregisterDynamicCommands,
  };
}
