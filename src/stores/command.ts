import type { CommandCallback, ExecuteCommandOptions } from 'orgnote-api';
import { type CommandsStore, type Command } from 'orgnote-api';
import { defineStore } from 'pinia';
import { api } from 'src/boot/api';
import { clientOnly } from 'src/utils/platform-specific';
import { ref, shallowRef, triggerRef } from 'vue';

export const useCommandsStore = defineStore<'commands', CommandsStore>('commands', () => {
  const commands = shallowRef<Command[]>([]);
  const callbacks = ref<Map<string, CommandCallback[]>>(new Map());

  const register = (...newCommands: Command[]) => {
    if (!newCommands.length) {
      return;
    }
    commands.value.push(...newCommands);
    triggerRef(commands);
  };

  const unregister = (...commandsToUnregister: Command[]) => {
    const unregisterCommandsNames = new Set(commandsToUnregister.map((c) => c.command));
    commands.value = commands.value.filter((c) => !unregisterCommandsNames.has(c.command));
  };

  const get = (name: string) => {
    return commands.value.find((c) => c.command === name);
  };

  const canExecuteCommand = (command?: Command): command is Command =>
    Boolean(command && !command.disabled?.(api));

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

  const execute = async (name: string, data?: unknown, options?: ExecuteCommandOptions) => {
    const command = get(name);
    if (!canExecuteCommand(command)) {
      return;
    }

    await command.handler(api, {
      meta: command,
      data,
    });

    notifyListeners(name, data, command, options);
  };

  const notifyListeners = (
    name: string,
    data: unknown,
    command: Command,
    options?: ExecuteCommandOptions,
  ) => {
    const arr = callbacks.value.get(name);
    if (arr) {
      arr.forEach((cb) => cb(command, data, options));
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
