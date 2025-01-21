import type { CommandCallback } from 'orgnote-api';
import { type CommandsStore, type Command } from 'orgnote-api';
import { defineStore } from 'pinia';
import { api } from 'src/boot/api';
import { clientOnly } from 'src/utils/platform-specific';
import { ref } from 'vue';

export const useCommandsStore = defineStore<'commands', CommandsStore>('commands', () => {
  const commands = ref<Command[]>([]);

  const callbacks = ref<Map<string, CommandCallback[]>>(new Map());

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

  const afterExecute = (
    commandNames: string | string[],
    callback: CommandCallback,
  ): (() => void) => {
    const names = Array.isArray(commandNames) ? commandNames : [commandNames];

    names.forEach((commandName) => {
      if (!callbacks.value.has(commandName)) {
        callbacks.value.set(commandName, []);
      }
      callbacks.value.get(commandName)!.push(callback);
    });

    return () => {
      names.forEach((commandName) => {
        const arr = callbacks.value.get(commandName);
        if (!arr) return;
        callbacks.value.set(
          commandName,
          arr.filter((cb) => cb !== callback),
        );
      });
    };
  };

  const execute = async (name: string, data?: unknown) => {
    const command = get(name);
    if (!command) {
      return;
    }

    await command.handler(api, {
      meta: command,
      data,
    });

    notifyListeners(name, data, command);
  };

  const notifyListeners = (name: string, data: unknown, command: Command) => {
    const arr = callbacks.value.get(name);
    if (arr) {
      arr.forEach((cb) => cb(command, data));
    }
  };

  return {
    add: clientOnly(register),
    remove: clientOnly(unregister),
    get,
    commands,
    execute,
    afterExecute,
  };
});
