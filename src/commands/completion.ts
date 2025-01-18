import { DefaultCommands, type Command } from 'orgnote-api';

export function getCompletionCommands(): Command[] {
  const commands: Command[] = [
    {
      command: DefaultCommands.TOGGLE_COMMANDS,
      icon: 'terminal',
      description: 'toggle commands',
      group: 'completion',
      handler: () => {
        console.log('[line 13]: boo');
      },
    },
  ];

  return commands;
}
