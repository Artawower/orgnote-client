import { defineStore } from 'pinia';
import { type SidebarStore, type VueComponent } from 'orgnote-api';
import { usePanelState } from 'src/composables/use-panel-state';
import { FileManagerRef } from 'src/containers/file-manager-ref';

export const useSidebarStore = defineStore<'sidebar', SidebarStore>('sidebar', () => {
  const panel = usePanelState();

  const toggle = (cmp?: VueComponent) => {
    panel.openComponent(cmp ?? panel.component.value ?? FileManagerRef);
  };

  const store: SidebarStore = {
    ...panel,
    toggle,
  };

  return store;
});
