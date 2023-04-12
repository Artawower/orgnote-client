export const DEFAULT_KEYBINDING_GROUP = 'default';

export interface Keybinding {
  keySequence: string;
  description?: string;
  command?: string;
  group?: string;
  allowOnInput?: boolean;
  ignorePrompt?: boolean;
  handler: () => void;
}
