import type {
  CommandCallback,
  CommandHandlerParams,
  CommandWrapper,
  ExecuteCommandOptions,
} from 'orgnote-api';
import { type CommandsStore, type Command } from 'orgnote-api';
import { defineStore } from 'pinia';
import { api } from 'src/boot/api';
import { debugEmbeddedWidgetNavigation } from 'src/utils/org-editor/embedded-widget-runtime/debug';
import { clientOnly } from 'src/utils/platform-specific';
import { shallowRef, triggerRef } from 'vue';

const TRACED_COMMAND = 'editor.add-title';

const isTracedCommand = (name: string | undefined): boolean => name === TRACED_COMMAND;

const debugCommandStore = (event: string, context: Record<string, unknown> = {}): void => {
  debugEmbeddedWidgetNavigation(`command-store:${event}`, context);
};

export const useCommandsStore = defineStore<'commands', CommandsStore>('commands', () => {
  const commands = shallowRef<Command[]>([]);
  const callbacks = shallowRef<Map<string, CommandCallback[]>>(new Map());
  const wrappers = shallowRef<Map<string, CommandWrapper[]>>(new Map());

  const register = (...newCommands: Command[]) => {
    if (!newCommands.length) {
      return;
    }
    commands.value.push(...newCommands);
    triggerRef(commands);
    const traced = newCommands.filter((command) => isTracedCommand(command.command));
    if (!traced.length) return;
    debugCommandStore('add', {
      added: traced.map((command) => command.command),
      totalCommands: commands.value.length,
      matchingCommands: commands.value.filter((command) => isTracedCommand(command.command)).length,
    });
  };

  const unregister = (...commandsToUnregister: Command[]) => {
    const unregisterCommandsNames = new Set(commandsToUnregister.map((c) => c.command));
    commands.value = commands.value.filter((c) => !unregisterCommandsNames.has(c.command));
    const traced = commandsToUnregister.filter((command) => isTracedCommand(command.command));
    if (!traced.length) return;
    debugCommandStore('remove', {
      removed: traced.map((command) => command.command),
      totalCommands: commands.value.length,
    });
  };

  const get = (name: string) => {
    return commands.value.find((c) => c.command === name);
  };

  const canExecuteCommand = <TData, TResult>(
    command?: Command<TData, TResult>,
  ): command is Command<TData, TResult> => Boolean(command && !command.disabled?.(api));

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

  const sortWrappersByPriority = (items: CommandWrapper[]): CommandWrapper[] =>
    [...items].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  const getCommandWrappers = (name: string): CommandWrapper[] =>
    sortWrappersByPriority(wrappers.value.get(name) ?? []);

  const runOriginalCommand = async <TData, TResult>(
    command: Command<TData, TResult>,
    params: CommandHandlerParams<TData>,
  ): Promise<TResult | undefined> => await command.handler(api, params);

  const runCommandStep = async <TData, TResult>(
    command: Command<TData, TResult>,
    chain: CommandWrapper[],
    index: number,
    params: CommandHandlerParams<TData>,
  ): Promise<TResult | undefined> => {
    const wrapper = chain[index] as CommandWrapper<TData, TResult> | undefined;
    if (!wrapper) return await runOriginalCommand(command, params);

    return await wrapper.handler({
      api,
      command,
      params,
      next: (nextParams = params) => runCommandStep(command, chain, index + 1, nextParams),
    });
  };

  const runCommandChain = async <TData, TResult>(
    command: Command<TData, TResult>,
    params: CommandHandlerParams<TData>,
  ): Promise<TResult | undefined> =>
    await runCommandStep(command, getCommandWrappers(command.command ?? ''), 0, params);

  const execute = async <TData = unknown, TResult = unknown>(
    name: string,
    data?: TData,
    options?: ExecuteCommandOptions,
  ): Promise<TResult | undefined> => {
    const command = get(name) as Command<TData, TResult> | undefined;
    const canExecute = canExecuteCommand(command);
    if (isTracedCommand(name)) {
      debugCommandStore('execute-request', {
        name,
        found: Boolean(command),
        canExecute,
        totalCommands: commands.value.length,
        wrapperCount: getCommandWrappers(name).length,
        options,
      });
    }
    if (!canExecute) {
      return;
    }

    const params = {
      meta: command,
      data,
    } as CommandHandlerParams<TData>;
    const result = await runCommandChain(command, params);

    if (isTracedCommand(name)) debugCommandStore('execute-complete', { name });
    notifyListeners(name, data, command, options);
    return result;
  };

  const wrap = <TData = unknown, TResult = unknown>(
    name: string,
    wrapper: CommandWrapper<TData, TResult>,
  ): (() => void) => {
    const current = wrappers.value.get(name) ?? [];
    const next = current.filter((item) => item.id !== wrapper.id);
    wrappers.value.set(name, [...next, wrapper as CommandWrapper]);

    return () => {
      const registered = wrappers.value.get(name) ?? [];
      wrappers.value.set(
        name,
        registered.filter((item) => item !== wrapper),
      );
    };
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
    wrap,
    afterExecute,
  };
});
