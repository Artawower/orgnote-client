export const DEFAULT_KEYBINDING_GROUP = 'default';

export interface Keybinding {
  keySequence?: string; // TODO: add support for multiple key sequences
  description?: string;
  command?: string;
  group?: string;
  allowOnInput?: boolean;
  ignorePrompt?: boolean;
  handler: () => void;
}
