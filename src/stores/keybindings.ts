import { useCompletionStore } from './completion';
import { defineStore } from 'pinia';
import { Command, DEFAULT_KEYBINDING_GROUP } from 'src/api';
import hotkeys from 'src/tools/tinykeys-wrapper';

import { computed, ref } from 'vue';

type GroupedKeybindings = { [key: string]: Command[] };

export const useKeybindingStore = defineStore('keybindings', () => {
  const keybindings = ref<{ [command: string]: Command }>({});

  const groupedKeybindings = computed<GroupedKeybindings>(() =>
    Object.values(keybindings.value).reduce<GroupedKeybindings>(
      (acc, keybinding) => {
        const key = keybinding.group;
        acc[key] ??= [];
        acc[key].push(keybinding);
        return acc;
      },
      {}
    )
  );

  const keybindingList = computed<Command[]>(() =>
    Object.values(keybindings.value)
  );

  let unregisterFunctions: (() => void)[] = [];

  // TODO: master hashmap
  const unattachHotkeys = () => {
    unregisterFunctions.forEach((unregister) => unregister());
    unregisterFunctions = [];
  };

  const deleteKeybinding = (command: string) => {
    const clonedBindings = { ...keybindings.value };
    if (clonedBindings[command]) {
      delete clonedBindings[command];
    }
    keybindings.value = clonedBindings;
  };

  const attachHotkeys = () => {
    Object.values(keybindings.value).forEach((k) => {
      const command = {
        [k.keySequence as string]: (event: KeyboardEvent) =>
          k.handler({ event }),
      };
      unregisterFunctions.push(hotkeys(window, command, !k.allowOnInput));
    });
  };

  const completionStore = useCompletionStore();

  const registerKeybindings = (kb: Command[]) => {
    unattachHotkeys();
    const registerKeybindings = kb.reduce<{
      [command: string]: Command;
    }>((acc, k) => {
      k.group ??= DEFAULT_KEYBINDING_GROUP;
      acc[k.command] = k;
      return acc;
    }, {});

    keybindings.value = {
      ...keybindings.value,
      ...registerKeybindings,
    };
    attachHotkeys();
  };

  const uregisterKeybindings = (kb: Command[]) => {
    unattachHotkeys();
    kb.forEach((k) => {
      delete keybindings.value[k.command];
    });
    attachHotkeys();
  };

  // TODO: master move to commands store
  const executeCommand = ({
    command,
    commandHandler,
    data,
  }: {
    command?: string;
    commandHandler?: (data?: unknown) => void;
    data?: unknown;
  }) => {
    if (commandHandler) {
      commandHandler(data);
      completionStore.closeCompletion();
      return;
    }
    keybindings.value[command]?.handler?.({ data });
  };

  return {
    keybindingList,
    executeCommand,
    registerKeybindings,
    deleteKeybinding,
    groupedKeybindings,
    uregisterKeybindings,
  };
});
