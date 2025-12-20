import { defineStore } from 'pinia';
import { defineAsyncComponent, ref, shallowRef } from 'vue';
import type { ComponentConfig } from 'orgnote-api';
import {
  DefaultCommands,
  type CommandName,
  type SidebarStore,
  type VueComponent,
} from 'orgnote-api';

export const useSidebarStore = defineStore<'sidebar', SidebarStore>('sidebar', () => {
  const opened = ref(false);

  const component = shallowRef<VueComponent>();
  const componentConfig = shallowRef<ComponentConfig<VueComponent>>();

  const commands = ref<CommandName[]>([
    DefaultCommands.TOGGLE_FILE_MANAGER,
    DefaultCommands.CREATE_NOTE,
    DefaultCommands.SEARCH,
    DefaultCommands.OPEN_DASHBOARD,
    DefaultCommands.SHOW_TAB_SWITCHER,
    DefaultCommands.OPEN_GRAPH,
  ]);
  const footerCommands = ref<CommandName[]>([
    DefaultCommands.TOGGLE_COMMANDS,
    DefaultCommands.PROJECT_INFO,
    DefaultCommands.SETTINGS,
    DefaultCommands.TOGGLE_SIDEBAR,
  ]);

  const addCommand = (command: CommandName) => {
    commands.value.push(command);
  };

  const removeCommand = (command: CommandName) => {
    const index = commands.value.indexOf(command);
    if (index !== -1) {
      commands.value.splice(index, 1);
    }
  };

  const close = () => {
    opened.value = false;
  };
  const open = () => {
    opened.value = true;
  };

  const openComponent = <T extends VueComponent>(cmp: T, config?: ComponentConfig<T>) => {
    if (cmp.__name === component.value?.__name && opened.value) {
      return;
    }
    opened.value = true;
    componentConfig.value = config;
    component.value = cmp;
  };

  const toggle = (cmp?: VueComponent) => {
    if (opened.value) {
      close();
      return;
    }
    if (component.value) {
      open();
      return;
    }
    if (cmp) {
      openComponent(cmp, componentConfig.value);
    }
    openComponent(
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
    opened,
    open,
    toggle,
    component,
    close,
    openComponent,
    commands,
    footerCommands,
    addCommand,
    removeCommand,
    componentConfig,
  };

  return store;
});
