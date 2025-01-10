import { type CommandsStore, type Command } from 'orgnote-api';
import { defineStore } from 'pinia';
import { clientOnly } from 'src/utils/platform-specific';
import { ref } from 'vue';

export const useCommandsStore = defineStore<'commands', CommandsStore>('commands', () => {
  const commands = ref<Command[]>([]);

  const register = (...newCommands: Command[]) => {
    if (!newCommands.length) {
      return;
    }
    commands.value.push(...newCommands);
  };

  const unregister = (...commandsToUnregister: Command[]) => {
    const unregisterCommandsNames = new Set(commandsToUnregister.map((c) => c.command));
    commands.value = commands.value.filter((c) => !unregisterCommandsNames.has(c.command));
  };

  const get = (name: string) => {
    return commands.value.find((c) => c.command === name);
  };

  const execute = async (name: string, data?: unknown) => {
    console.log('✎: [line 26][command.ts<stores>] name: ', name);
    const command = get(name);
    console.log('✎: [line 28][command.ts<stores>] command: ', command);
    if (!command) {
      return;
    }
    await command.handler({
      meta: command,
      data,
    });
  };

  return {
    add: clientOnly(register),
    remove: clientOnly(unregister),
    get,
    commands,
    execute,
  };
});
