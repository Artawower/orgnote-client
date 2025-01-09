import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import {
  DefaultCommands,
  type CommandName,
  type SidebarStore,
  type VueComponent,
} from 'orgnote-api';

export const useSidebarStore = defineStore<'sidebar', SidebarStore>('sidebar', () => {
  const opened = ref(false);

  const component = shallowRef<VueComponent>(null);
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

  const openComponent = (cmp: VueComponent) => {
    opened.value = true;
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
    openComponent(cmp);
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
  };

  return store;
});
