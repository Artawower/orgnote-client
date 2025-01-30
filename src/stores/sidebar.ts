import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import type { ComponentConfig } from 'orgnote-api';
import {
  DefaultCommands,
  type CommandName,
  type SidebarStore,
  type VueComponent,
} from 'orgnote-api';

export const useSidebarStore = defineStore<'sidebar', SidebarStore>('sidebar', () => {
  const opened = ref(false);

  const component = shallowRef<VueComponent>(null);
  const componentConfig = shallowRef<ComponentConfig<VueComponent>>();

  const commands = ref<CommandName[]>([
    DefaultCommands.TOGGLE_FILE_MANAGER,
    DefaultCommands.CREATE_NOTE,
    DefaultCommands.SEARCH,
    DefaultCommands.OPEN_DASHBOARD,
    DefaultCommands.OPEN_GRAPH,
  ]);
  const footerCommands = ref<CommandName[]>([
    DefaultCommands.TOGGLE_COMMANDS,
    DefaultCommands.SETTINGS,
    DefaultCommands.PROJECT_INFO,
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
    open();
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
