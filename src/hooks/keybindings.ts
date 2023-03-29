import { ref, watch } from 'vue';
import { useKeybindingStore } from 'src/stores/keybindings';
import { Keybinding, KeybindingCommand } from 'src/models';
import hotkeys from 'src/tools/tinykeys-wrapper';
import { useCommandsStore } from 'src/stores';

export function useKeybindings() {
  const keybindingStore = useKeybindingStore();

  const keybindingCommandHandlers = ref<{ [key: string]: () => void }>(null);
  const commandsStore = useCommandsStore();

  const registerKeybinding = (k: Keybinding) => {
    const commandHandler = keybindingCommandHandlers.value?.[k.command];
    if (!commandHandler) {
      return;
    }

    const handler = {
      [k.keySequence]: commandHandler,
    };
    console.log('✎: [line 22][keybindings.ts] handler: ', handler);

    // TODO: master need to finalize this solution to work catch keybindings
    // for different groups
    hotkeys(window, handler, !k.allowOnInput);
  };

  watch(
    () => keybindingStore.keybindings,
    (keybindings) => {
      if (!keybindings) {
        return;
      }
      // TODO: master REMOVE PREIVIOUS KEYBINDINGS BEFORE ATTACH
      Object.values(keybindings).forEach((k) => registerKeybinding(k));
    }
  );

  const registerKeybindingCommandHandlers = (handlers: {
    [key: string]: () => void;
  }) => {
    keybindingCommandHandlers.value = handlers;
  };

  const registerKeybindings = (keybindings: Keybinding[]) => {
    keybindings.forEach((k) => keybindingStore.registerKeybinding(k));
  };

  const registerKeybindingCommands = (
    keybindingCommands: KeybindingCommand[]
  ) => {
    const [keybindings, handlers] = keybindingCommands.reduce<
      [Keybinding[], { [keu: string]: () => void }]
    >(
      (acc, kc) => {
        const keybinding: Keybinding = { ...kc };
        delete (keybinding as KeybindingCommand).handler;
        acc[0].push(keybinding);
        acc[1][kc.command] = kc.handler;
        return acc;
      },
      [[], {}]
    );
    commandsStore.registerCommands(handlers);
    registerKeybindingCommandHandlers(handlers);
    registerKeybindings(keybindings);
  };

  return {
    registerKeybindingCommandHandlers,
    registerKeybindings,
    registerKeybindingCommands,
  };
}
