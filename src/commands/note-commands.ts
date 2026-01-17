import type { Command, CommandHandlerParams, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands } from 'orgnote-api';
import { useNotePickCompletion } from 'src/composables/file-pick-completion';

export function getNoteCommands(): Command[] {
  const commands: Command[] = [
    {
      command: DefaultCommands.OPEN_NOTE,
      title: DefaultCommands.OPEN_NOTE,
      group: 'note',
      icon: 'sym_o_edit_square',
      handler: async (api: OrgNoteApi, params?: CommandHandlerParams<{ path: string }>) => {
        const path = params?.data?.path ?? (await useNotePickCompletion(api, '/'));

        if (!path) {
          return;
        }

        const bufferViewer = api.core.useBufferViewer();
        await bufferViewer.open(path);
      },
    },
  ];

  return commands;
}
