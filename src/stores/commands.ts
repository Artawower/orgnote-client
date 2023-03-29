import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCommandsStore = defineStore('commands', () => {
  const commands = ref<{ [key: string]: () => void }>({});

  const registerCommands = (newCommands: { [key: string]: () => void }) => {
    commands.value = { ...commands.value, ...newCommands };
  };

  const executeCommand = (command: string) => {
    commands.value[command]?.();
  };

  return {
    commands,
    registerCommands,
    executeCommand,
  };
});
