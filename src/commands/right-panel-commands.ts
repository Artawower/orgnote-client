import type { Command, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands } from 'orgnote-api';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import { computed } from 'vue';
import OrgAstDebugger from 'src/components/OrgAstDebugger.vue';

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
      handler: async (api: OrgNoteApi) => {
        const panel = api.ui.useRightPanel();
        const { opened, component, commands } = storeToRefs(panel);
        if (opened.value) {
          panel.close();
          return;
        }
        if (component.value) {
          panel.open();
          return;
        }
        const firstContentCommand = commands.value.find(
          (cmd) => cmd !== DefaultCommands.TOGGLE_RIGHT_PANEL,
        );
        if (firstContentCommand) {
          await api.core.useCommands().execute(firstContentCommand);
        }
      },
    },
    {
      command: DefaultCommands.TOGGLE_AST_DEBUGGER,
      group,
      icon: 'sym_o_code',
      handler: (api: OrgNoteApi) => {
        const rightPanel = api.ui.useRightPanel();
        rightPanel.openComponent(OrgAstDebugger);
      },
    },
  ];
}
