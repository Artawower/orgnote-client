import { Keybinding } from 'src/models';
import { useCompletionStore } from 'src/stores';
import { useKeybindingStore } from 'src/stores/keybindings';

export function useCommandExecutor() {
  const { registerKeybindings, executeCommand, uregisterKeybindings } =
    useKeybindingStore();

  const completionStore = useCompletionStore();

  const keybindingCommands: Keybinding[] = [
    {
      command: 'toggleExecuteCommand',
      keySequence: 'Alt+KeyX',
      description: 'Toggle command executor',
      group: 'Completion',
      allowOnInput: true,
      handler: () => {
        completionStore.toggleCompletion();
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
        executeCommand(completionStore.selectedCandidate.command);
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
