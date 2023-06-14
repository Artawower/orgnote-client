import { Keybinding } from 'src/models';
import { useCompletionStore, useSearchStore } from 'src/stores';
import { useKeybindingStore } from 'src/stores/keybindings';

export enum COMMAND {
  openSearch = 'openSearch',
}
export function useCommandExecutor() {
  const { registerKeybindings, executeCommand, uregisterKeybindings } =
    useKeybindingStore();

  const completionStore = useCompletionStore();
  const keybindingStore = useKeybindingStore();
  const searchStore = useSearchStore();

  const keybindingCommands: Keybinding[] = [
    {
      command: 'toggleExecuteCommand',
      keySequence: 'Alt+KeyX',
      description: 'Toggle command executor',
      group: 'Completion',
      allowOnInput: true,
      handler: () => {
        completionStore.toggleCompletion();
        keybindingStore.initCompletionCandidatesGetter();
        setTimeout(() => completionStore.setFilter(''));
      },
    },
    {
      command: COMMAND.openSearch,
      keySequence: '/',
      description: 'search notes',
      group: 'Search',
      handler: () => {
        completionStore.openCompletion();
        searchStore.initCompletionCandidatesGetter();
        setTimeout(() => completionStore.setFilter(''));
      },
    },
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
