export const DEFAULT_KEYBINDING_GROUP = 'default';

export interface Command {
  keySequence?: string; // TODO: add support for multiple key sequences
  description?: string;
  command?: string;
  group?: string;
  /* Where is this command available, default value is global */
  scope?: 'editor' | 'global' | 'note-detail' | string;
  allowOnInput?: boolean;
  ignorePrompt?: boolean;
  handler: (event?: KeyboardEvent) => void;
}
