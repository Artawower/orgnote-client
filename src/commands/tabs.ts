import type { Command, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands, I18N, TABS_COMMAND_GROUP } from 'orgnote-api';
import { useTabCompletion } from '../composables/tab-completion';

export function getTabsCommands(): Command[] {
  const commands: Command[] = [
    {
      command: DefaultCommands.NEW_TAB,
      group: TABS_COMMAND_GROUP,
      icon: 'sym_o_add_box',
      title: I18N.ADD_NEW_TAB,
      handler: async (api: OrgNoteApi, params) => {
        const paneStore = api.core.usePane();
        const targetPaneId = params?.data?.paneId || paneStore.activePaneId;

        if (!targetPaneId) return;

        const tab = await paneStore.addTab(targetPaneId, params?.data);
        if (!tab) return;

        paneStore.selectTab(tab.paneId, tab.id);
        api.ui.useModal().close();
      },
    },
    {
      command: DefaultCommands.TABS,
      group: TABS_COMMAND_GROUP,
      icon: 'sym_o_tabs',
      title: I18N.TABS,
      handler: useTabCompletion,
    },
    {
      command: DefaultCommands.SHOW_TAB_SWITCHER,
      group: TABS_COMMAND_GROUP,
      icon: 'sym_o_tab_group',
      title: I18N.SHOW_TAB_SWITCHER,
      hide: (api: OrgNoteApi) => {
        return api.ui.useScreenDetection().desktopAbove.value;
      },
      handler: async (api: OrgNoteApi) => {
        const modal = api.ui.useModal();
        const { default: TabOverviewMobile } = await import(
          'src/containers/TabOverviewMobileModal.vue'
        );
        modal.open(TabOverviewMobile, {
          fullScreen: true,
          noPadding: true,
        });
      },
    },
  ];

  return commands;
}
