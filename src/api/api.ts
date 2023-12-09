import { Command } from './command';
import { sdk } from 'src/boot/axios';
import { Note } from 'src/models';

export interface OrgNoteApi {
  [key: string]: unknown;
  getExtension<T>(config: string): T;

  navigation: {
    openNote: (id: string) => void;
    editNote: (id: string) => void;
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
