import { defineStore } from 'pinia';
import {
  Keybinding,
  DEFAULT_KEYBINDING_GROUP,
} from 'src/models/keybinding.model';

type GroupedKeybindings = { [key: string]: Keybinding[] };

interface KeybindingsState {
  keybindings: { [key: string]: Keybinding };
  keybindingRegistered: Keybinding;
  keybindingCommand: string;
  keybindingRemoved: string;
}

export const useKeybindingStore = defineStore('keybindings', {
  state: (): KeybindingsState => ({
    keybindings: {},
    keybindingRegistered: null,
    keybindingCommand: null,
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
      this.keybindings[keybinding.command] = keybinding;
      this.keybindingRegistered = keybinding;
    },
    deleteKeybinding(command: string) {
      if (this.keybindings[command]) {
        delete this.keybindings[command];
        this.keybindingRemoved = command;
      }
    },
    emitKeybindingCommand(command: string) {
      this.keybindingCommand = command;
    },
  },
  persist: true,
});
