import { defineStore } from 'pinia';
import { defineAsyncComponent, ref } from 'vue';
import { DefaultCommands, type SidebarStore, type VueComponent } from 'orgnote-api';
import { usePanelState } from 'src/composables/use-panel-state';

export const useSidebarStore = defineStore<'sidebar', SidebarStore>('sidebar', () => {
  const panel = usePanelState([
    DefaultCommands.TOGGLE_FILE_MANAGER,
    DefaultCommands.CREATE_NOTE,
    DefaultCommands.SEARCH,
    DefaultCommands.OPEN_DASHBOARD,
    DefaultCommands.SHOW_TAB_SWITCHER,
    DefaultCommands.OPEN_GRAPH,
  ]);

  const footerCommands = ref([
    DefaultCommands.TOGGLE_COMMANDS,
    DefaultCommands.PROJECT_INFO,
    DefaultCommands.SETTINGS,
    DefaultCommands.TOGGLE_SIDEBAR,
  ]);

  const toggle = (cmp?: VueComponent) => {
    if (panel.opened.value) {
      panel.close();
      return;
    }
    if (panel.component.value) {
      panel.open();
      return;
    }
    if (cmp) {
      panel.openComponent(cmp, panel.componentConfig.value);
      return;
    }
    panel.openComponent(
      defineAsyncComponent(() => import('src/containers/FileManager.vue')),
      {
        componentProps: {
          closable: false,
          tree: true,
          compact: true,
        },
      },
    );
  };

  const store: SidebarStore = {
    ...panel,
    toggle,
    footerCommands,
  };

  return store;
});
