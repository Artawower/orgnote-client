import { defineStore } from 'pinia';
import { defineAsyncComponent } from 'vue';
import { type SidebarStore, type VueComponent } from 'orgnote-api';
import { usePanelState } from 'src/composables/use-panel-state';

export const useSidebarStore = defineStore<'sidebar', SidebarStore>('sidebar', () => {
  const panel = usePanelState();

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
  };

  return store;
});
