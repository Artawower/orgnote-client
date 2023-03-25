import { ref, watch } from 'vue';
import { createKeybindingsHandler } from 'tinykeys';
import { useKeybindingStore } from 'src/stores/keybindings';
import { Keybinding } from 'src/models';

export function useKeybindings() {
  const keybindingStore = useKeybindingStore();

  const keybindingCommandHandlers = ref<{ [key: string]: () => void }>(null);

  const registerKeybinding = (k: Keybinding) => {
    const commandHandler = keybindingCommandHandlers.value?.[k.command];
    if (!commandHandler) {
      return;
    }

    const handler = createKeybindingsHandler({
      [k.keySequence]: commandHandler,
    });

    window?.addEventListener('keydown', handler);
  };

  watch(
    () => keybindingStore.keybindingRegistered,
    (keybinding) => {
      if (!keybinding) {
        return;
      }
      registerKeybinding(keybinding);
      console.log('✎: [line 36][MainLayout.vue] keybinding: ', keybinding);
    }
  );

  const registerKeybindingCommandHandlers = (handlers: {
    [key: string]: () => void;
  }) => {
    keybindingCommandHandlers.value = handlers;
  };

  const registerKeybindings = (keybindings: Keybinding[]) => {
    keybindings.forEach((k) =>
      keybindingStore.registerKeybinding({
        keySequence: k.keySequence,
        command: k.command,
        description: k.description,
      })
    );
  };

  return {
    registerKeybindingCommandHandlers,
    registerKeybindings,
  };
}
