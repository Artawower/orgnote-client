import { type CommandsStore, clientOnly, type Command } from 'orgnote-api';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCommandsStore = defineStore<'commands', CommandsStore>('commands', () => {
  const commands = ref<Command[]>([]);

  const register = (...newCommands: Command[]) => {
    console.log('✎: [line 9][commands-store.ts<stores>] newCommands: ', newCommands);
    if (!newCommands.length) {
      return;
    }
    commands.value.push(...newCommands);
  };

  const unregister = (...commandsToUnregister: Command[]) => {
    const unregisterCommandsNames = new Set(commandsToUnregister.map((c) => c.command));
    commands.value = commands.value.filter((c) => !unregisterCommandsNames.has(c.command));
  };

  const getCommand = (name: string) => {
    return commands.value.find((c) => c.command === name);
  };

  return {
    register: clientOnly(register),
    unregister: clientOnly(unregister),
    getCommand,
    commands,
  };
});
