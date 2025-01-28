import type { CompletionCandidate, CompletionSearchResult, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands, I18N, type Command } from 'orgnote-api';
import type { IFuseOptions } from 'fuse.js';
import Fuse from 'fuse.js';

const toggleCommandsHandler = (api: OrgNoteApi) => {
  const completion = api.core.useCompletion();
  const cmds = api.core.useCommands();

  const getCommands = (commands: Command[]): CompletionCandidate<Command>[] => {
    return commands.reduce<CompletionCandidate<Command>[]>((acc, cmd) => {
      acc.push({
        group: cmd.group,
        icon: cmd.icon,
        title: cmd.title ?? cmd.command,
        data: cmd,
        description: cmd.description,
        commandHandler: () => cmds.execute(cmd.command),
      });
      return acc;
    }, []);
  };

  const fuseOptions: IFuseOptions<CompletionCandidate<Command>> = {
    threshold: 0.4,
    keys: ['title', 'description', 'group', 'command'],
  };

  const itemsGetter = (filter: string) => {
    const commands = getCommands(cmds.commands);
    const fuse = new Fuse(commands, fuseOptions);
    const result = filter ? fuse.search(filter).map((r) => r.item) : commands;

    const res: CompletionSearchResult<Command> = {
      total: result.length,
      result,
    };

    return res;
  };
  completion.open<Command>({
    itemsGetter,
    placeholder: I18N.EXECUTE_COMMAND,
    type: 'choice',
    searchText: '',
  });
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
