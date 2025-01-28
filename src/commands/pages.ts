import type { Command, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands, I18N } from 'orgnote-api';

export function getPagesCommands(): Command[] {
  const commands: Command[] = [
    {
      command: DefaultCommands.NEW_PAGE,
      group: 'pages',
      icon: 'sym_o_add_box',
      title: I18N.ADD_NEW_PAGE,
      handler: (api: OrgNoteApi, params) => {
        const pane = api.core.usePane();
        pane.addPage(params.data);
      },
    },
  ];

  return commands;
}
