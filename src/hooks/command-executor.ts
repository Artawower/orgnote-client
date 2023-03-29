import { useKeybindings } from './keybindings';
import { useCommandsStore, useCompletionStore } from 'src/stores';
import { useKeybindingStore } from 'src/stores/keybindings';
import { KeybindingCommand } from 'src/models';

export function useCommandExecutor() {
  const { registerKeybindingCommands } = useKeybindings();

  const completionStore = useCompletionStore();
  const keybindingsStore = useKeybindingStore();
  const commandsStore = useCommandsStore();

  const setCompletionCandidates = () => {
    completionStore.setCandidates(
      keybindingsStore.keybindingList
        .filter((k) => !k.ignorePrompt)
        .map((k) => ({
          command: k.command,
          description: k.description,
          group: k.group,
          icon: 'settings',
        }))
    );
  };

  const keybindingCommands: KeybindingCommand[] = [
    {
      command: 'toggleExecuteCommand',
      keySequence: 'Alt+KeyX',
      description: 'Toggle command executor',
      group: 'Completion',
      allowOnInput: true,
      handler: () => {
        console.log('HEY?');
        setCompletionCandidates();
        completionStore.toggleCompletion();
        setTimeout(() => completionStore.setFilter(''));
      },
    },
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
        commandsStore.executeCommand(completionStore.selectedCandidate.command);
      },
    },
  ];

  const register = () => {
    registerKeybindingCommands(keybindingCommands);
  };

  return {
    register,
  };
}
