export const DEFAULT_KEYBINDING_GROUP = 'default';

export type CommandGroup =
  | 'settings'
  | 'editor'
  | 'global'
  | 'note-detail'
  | 'completion'
  | 'note-detail'
  | string;

export interface CommandHandlerParams {
  event?: KeyboardEvent;
  data?: unknown;
  [key: string]: unknown;
}

export interface Command {
  // TODO: add support for multiple key sequences
  keySequence?: string | string[];
  description?: string;
  command?: string;
  title?: string | (() => string);
  icon?: string | (() => string);
  /* Where is this command available, default value is global */
  group?: CommandGroup;
  allowOnInput?: boolean;
  ignorePrompt?: boolean;
  /* arguments depend on the current scope */
  handler: (params?: CommandHandlerParams) => unknown | Promise<unknown>;
}
