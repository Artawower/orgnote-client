import { Command, CommandHandlerParams, DefaultCommands } from 'orgnote-api';
import {
  useCommandsStore,
  useCompletionStore,
  useSearchStore,
} from 'src/stores';

export function getCompletionCommands(): Command[] {
  const completionStore = useCompletionStore();
  const commandsStore = useCommandsStore();
  const searchStore = useSearchStore();

  return [
    {
      command: DefaultCommands.TOGGLE_COMMANDS,
      keySequence: 'Alt+KeyX',
      description: 'Toggle command executor',
      icon: 'terminal',
      group: 'completion',
      allowOnInput: true,
      handler: (params?: CommandHandlerParams) => {
        completionStore.toggleCompletion();
        commandsStore.initCompletion();
        params?.event?.preventDefault();
      },
    },
    {
      command: DefaultCommands.SEARCH,
      keySequence: '/',
      description: 'search notes',
      icon: 'search',
      group: 'completion',
      handler: (params) => {
        searchStore.initCompletion();
        params.event?.preventDefault();
      },
    },
    {
      command: DefaultCommands.RESTORE_COMPLETION,
      keySequence: "'",
      description: 'restore last completion session',
      group: 'completion',
      handler: () => {
        completionStore.restoreLastCompletionSession();
      },
    },
    {
      command: DefaultCommands.EXIT_COMMAND_EXECUTOR,
      handler: () => {
        completionStore.closeCompletion();
      },
      keySequence: 'Escape',
      description: 'Exit command executor',
      group: 'completion',
      allowOnInput: true,
    },
    {
      command: DefaultCommands.NEXT_CANDIDATE,
      handler: () => {
        completionStore.nextCandidate();
      },
      ignorePrompt: true,
      keySequence: 'Control+KeyJ',
      description: 'Next candidate',
      group: 'completion',
      allowOnInput: true,
    },
    {
      command: DefaultCommands.PREV_CANDIDATE,
      handler: () => {
        completionStore.previousCandidate();
      },
      ignorePrompt: true,
      keySequence: 'Control+KeyK',
      description: 'Previous candidate',
      group: 'completion',
      allowOnInput: true,
    },
    {
      command: DefaultCommands.EXECUTE_CANDIDATE,
      keySequence: 'Enter',
      description: 'Execute candidate',
      group: 'completion',
      allowOnInput: true,
      ignorePrompt: true,
      handler: () => {
        if (!completionStore.opened) {
          return;
        }
        completionStore.executeCandidate(completionStore.selectedCandidate);
      },
    },
  ];
}
