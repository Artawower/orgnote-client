import { defineStore } from 'pinia';
import FileManagerSideBar from 'src/components/containers/FileManagerSideBar.vue';
import { VueComponent } from 'src/models';

import { ref, shallowRef } from 'vue';
import { useSettingsStore } from './settings';

export const useSidebarStore = defineStore('sidebar', () => {
  const opened = ref(false);

  const component = shallowRef<VueComponent>(null);
  const { setupStatusBar } = useSettingsStore();

  const close = () => {
    setupStatusBar('--bg');
    opened.value = false;
  };
  const open = () => {
    opened.value = true;
    setupStatusBar('--bg-alt');
  };

  const openComponent = (cmp: VueComponent) => {
    opened.value = true;
    component.value = cmp;
  };

  const toggleWithComponent = (cmp: VueComponent) => {
    if (opened.value && cmp === component.value) {
      close();
      return;
    }
    openComponent(cmp);
  };

  const toggleWithFallback = (cmp: VueComponent) => {
    if (opened.value) {
      close();
      return;
    }
    if (component.value) {
      open();
      return;
    }
    openComponent(cmp);
  };

  const toggle = () => {
    toggleWithFallback(FileManagerSideBar);
  };

  return {
    opened,
    open,
    toggle,
    component,
    close,
    openComponent,
    toggleWithComponent,
    toggleWithFallback,
  };
});
