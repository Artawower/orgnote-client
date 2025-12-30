import type { Command, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands } from 'orgnote-api';
import { api } from 'src/boot/api';
import { computed } from 'vue';

const group = 'right panel';

export function getRightPanelCommands(): Command[] {
  const rightPanel = api.ui.useRightPanel();
  return [
    {
      command: DefaultCommands.TOGGLE_RIGHT_PANEL,
      group,
      icon: computed(() =>
        rightPanel.opened ? 'sym_o_right_panel_close' : 'sym_o_right_panel_open',
      ),
      handler: (api: OrgNoteApi) => {
        api.ui.useRightPanel().toggle();
      },
    },
  ];
}
