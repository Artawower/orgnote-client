import { ref, shallowRef } from 'vue';
import type { ComponentConfig, VueComponent, CommandName } from 'orgnote-api';

export const usePanelState = (defaultCommands: CommandName[] = []) => {
  const opened = ref(false);
  const component = shallowRef<VueComponent>();
  const componentConfig = shallowRef<ComponentConfig<VueComponent>>();
  const commands = ref<CommandName[]>(defaultCommands);

  const open = () => {
    opened.value = true;
  };

  const close = () => {
    opened.value = false;
  };

  const toggle = () => {
    opened.value = !opened.value;
  };

  const openComponent = <T extends VueComponent>(cmp: T, config?: ComponentConfig<T>) => {
    componentConfig.value = config;
    component.value = cmp;
    open();
  };

  const addCommand = (command: CommandName) => {
    if (commands.value.includes(command)) {
      return;
    }
    commands.value.push(command);
  };

  const removeCommand = (command: CommandName) => {
    const index = commands.value.indexOf(command);
    if (index === -1) {
      return;
    }
    commands.value.splice(index, 1);
  };

  return {
    opened,
    component,
    componentConfig,
    commands,
    open,
    close,
    toggle,
    openComponent,
    addCommand,
    removeCommand,
  };
};
