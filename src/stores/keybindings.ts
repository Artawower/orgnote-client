import { defineStore } from 'pinia';
import {
  Keybinding,
  DEFAULT_KEYBINDING_GROUP,
} from 'src/models/keybinding.model';

type GroupedKeybindings = { [key: string]: Keybinding[] };

interface KeybindingsState {
  keybindings: { [key: string]: Keybinding };
  commands: { [key: string]: Keybinding };
}

export const useKeybindingStore = defineStore('keybindings', {
  state: (): KeybindingsState => ({
    keybindings: {},
    commands: {},
  }),
  getters: {
    groupedKeybindings(): GroupedKeybindings {
      return Object.values(this.keybindings).reduce<GroupedKeybindings>(
        (acc, keybinding) => {
          const key = keybinding.group;
          acc[key] ??= [];
          acc[key].push(keybinding);
          return acc;
        },
        {}
      );
    },
    keybindingList(): Keybinding[] {
      return Object.values(this.keybindings);
    },
  },
  actions: {
    registerKeybinding(keybinding: Keybinding) {
      const existingKeybinding = this.keybindings[keybinding.command];
      if (
        existingKeybinding &&
        existingKeybinding.command !== keybinding.command
      ) {
        console.warn(`Keybinding for ${keybinding.command} already exists`);
        keybinding.command = null;
      }
      if (!keybinding.group) {
        keybinding.group = DEFAULT_KEYBINDING_GROUP;
      }
      this.deleteKeybinding(keybinding.command);
      this.keybindings = {
        ...this.keybindings,
        [keybinding.command]: keybinding,
      };
    },
    deleteKeybinding(command: string) {
      const clonedBindings = { ...this.keybindings };
      if (clonedBindings[command]) {
        delete clonedBindings[command];
      }
      this.keybindings = clonedBindings;
    },
  },
  persist: true,
});
