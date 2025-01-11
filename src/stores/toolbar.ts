import { DefaultCommands, type CommandName, type ToolbarStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToolbarStore = defineStore<'toolbar', ToolbarStore>('toolbar', () => {
  const commands = ref<CommandName[]>([
    DefaultCommands.TOGGLE_SIDEBAR,
    DefaultCommands.CREATE_NOTE,
    DefaultCommands.SEARCH,
    DefaultCommands.TOGGLE_COMMANDS,
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

  const store: ToolbarStore = {
    commands,
    addCommand,
    removeCommand,
  };

  return store;
});
