export const DEFAULT_KEYBINDING_GROUP = 'default';

export type CommandGroup =
  | 'settings'
  | 'editor'
  | 'global'
  | 'note-detail'
  | 'completion'
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
  icon?: string;
  /* Where is this command available, default value is global */
  group?: CommandGroup;
  allowOnInput?: boolean;
  ignorePrompt?: boolean;
  /* arguments depend on the current scope */
  handler: (params?: CommandHandlerParams) => unknown | Promise<unknown>;
}
