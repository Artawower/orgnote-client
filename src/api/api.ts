import { Command } from './command';
import { CSSVariable, ThemeVariable } from './theme-variables';
import { sdk } from 'src/boot/axios';
import { Note } from 'src/models';
import { NavigationFailure } from 'vue-router';
import { z } from 'zod';

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
    applyCssVariables: (styles: {
      [key in CSSVariable]: string | number;
    }) => void;
    setThemeByMode: (themeName?: string) => void;
    setDarkTheme: (themeName?: string) => void;
    setLightTheme: (themeName?: string) => void;
    applyStyles: (scopeName: string, styles: string) => void;
    removeStyles: (scopeName: string) => void;
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

export const orgnoteApiSchema = z.object({
  editor: z.object({
    showSpecialSymbols: z.boolean(),
    showPropertyDrawer: z.boolean(),
  }),
  common: z.object({
    developerMode: z.boolean(),
    maximumLogsCount: z.number(),
  }),
  completion: z.object({
    showGroup: z.boolean(),
    defaultCompletionLimit: z.number(),
  }),
  ui: z.object({
    theme: z.literal('light').or(z.literal('dark')),
    darkThemeName: z.optional(z.string()),
    lightThemeName: z.optional(z.string()),
  }),
  extensions: z.object({
    sources: z.array(z.string()),
  }),
});

export type OrgNoteConfig = z.infer<typeof orgnoteApiSchema>;
