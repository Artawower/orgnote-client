import { DefaultCommands, I18N, type Command, type OrgNoteApi } from 'orgnote-api';
import { selectCommand } from 'src/utils/select-command';

const toggleCommandsHandler = async (api: OrgNoteApi) => {
  const command = await selectCommand(api, I18N.EXECUTE_COMMAND);
  if (command && command.command) {
    await api.core.useCommands().execute(command.command, undefined, { interactive: true });
  }
};

export function getCompletionCommands(): Command[] {
  const commands: Command[] = [
    {
      command: DefaultCommands.TOGGLE_COMMANDS,
      icon: 'terminal',
      description: 'toggle commands',
      group: 'completion',
      handler: toggleCommandsHandler,
    },
  ];

  return commands;
}
