import type { CompletionSearchResult } from 'orgnote-api';
import { DefaultCommands, TXT_EXECUTE_COMMAND, type Command } from 'orgnote-api';
import { api } from 'src/boot/api';

export function getCompletionCommands(): Command[] {
  const commands: Command[] = [
    {
      command: DefaultCommands.TOGGLE_COMMANDS,
      icon: 'terminal',
      description: 'toggle commands',
      group: 'completion',
      handler: () => {
        const completion = api.core.useCompletion();
        const itemsGetter = (filter: string, limit?: number, offset?: number) => {
          console.log(
            '✎: [line 14][completion.ts<commands>] filter: string, limit?: number, offset?: number: ',
            filter,
            limit,
            offset,
          );
          const res: CompletionSearchResult<string> = {
            total: 3,
            result: [
              { data: 'hello', commandHandler: () => '' },
              { data: 'world', commandHandler: () => '' },
            ],
          };

          return res;
        };
        completion.open<string>({
          itemsGetter,
          placeholder: TXT_EXECUTE_COMMAND,
          searchText: '',
        });
        console.log('[line 13]: boo');
      },
    },
  ];

  return commands;
}
