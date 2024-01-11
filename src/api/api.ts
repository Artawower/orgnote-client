import { Command } from './command';
import { CSSVariable, ThemeVariable } from './theme-variables';
import { sdk } from 'src/boot/axios';
import { Note } from 'src/models';
import { NavigationFailure } from 'vue-router';

export interface OrgNoteApi {
  [key: string]: unknown;
  getExtension?<T>(config: string): T;

  system: {
    reload: (params?: { verbose: boolean }) => Promise<void>;
  };
  navigation: {
    openNote: (id: string) => Promise<void | NavigationFailure>;
    editNote: (id: string) => Promise<void | NavigationFailure>;
  };
  ui: {
    applyTheme: (theme: { [key in ThemeVariable]: string | number }) => void;
    applyStyles: (styles: { [key in CSSVariable]: string | number }) => void;
    resetTheme: () => void;
  };
  interaction: {
    confirm: (title: string, message: string) => Promise<boolean>;
  };
  currentNote: {
    getCurrentNote: () => Note;
  };
  // hooks: {
  //   add: () => void;
  // };
  editor: {
    widgets: {
      add: () => void;
    };
  };
  commands: {
    add(...commands: Command[]): void;
    // delete(...commands: Command[]): void;
    // update(...commands: Command[]): void;
  };
  configuration: () => OrgNoteConfig;
  sdk: typeof sdk;
}

// TODO: add config for runtime validation and command builders
export interface OrgNoteConfig {
  editor: {
    showSpecialSymbols: boolean;
    showPropertyDrawer: boolean;
  };
  common: {
    developerMode: boolean;
    maximumLogsCount: number;
  };
  completion: {
    showGroup: boolean;
    defaultCompletionLimit: number;
  };
}
