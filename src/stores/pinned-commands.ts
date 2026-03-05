import {
  DefaultCommands,
  type CommandContext,
  type CommandName,
  type PinnedCommandsStore,
} from 'orgnote-api';
import { defineStore } from 'pinia';
import { computed, ref, type Ref } from 'vue';

const DEFAULT_COMMANDS: Record<CommandContext, CommandName[]> = {
  sidebar: [
    DefaultCommands.TOGGLE_FILE_MANAGER,
    DefaultCommands.CREATE_NOTE,
    DefaultCommands.SEARCH,
    DefaultCommands.OPEN_DASHBOARD,
    DefaultCommands.SHOW_TAB_SWITCHER,
    DefaultCommands.OPEN_GRAPH,
  ],
  'sidebar-footer': [
    DefaultCommands.TOGGLE_COMMANDS,
    DefaultCommands.PROJECT_INFO,
    DefaultCommands.SETTINGS,
    DefaultCommands.TOGGLE_SIDEBAR,
  ],
  'right-header': [DefaultCommands.TOGGLE_RIGHT_SIDEBAR, DefaultCommands.SHOW_FILE_INFO],
  'right-sidebar': [DefaultCommands.TOGGLE_RIGHT_SIDEBAR, DefaultCommands.TOGGLE_AST_DEBUGGER],
  'edit-toolbar': [
    DefaultCommands.TOGGLE_SIDEBAR,
    DefaultCommands.CREATE_NOTE,
    DefaultCommands.SEARCH,
    DefaultCommands.TOGGLE_COMMANDS,
    DefaultCommands.SHOW_TAB_SWITCHER,
  ],
  'editor-actions': [
    DefaultCommands.EDITOR_UNDO,
    DefaultCommands.EDITOR_REDO,
    DefaultCommands.EDITOR_INSERT_HEADLINE,
    DefaultCommands.EDITOR_INSERT_BOLD,
    DefaultCommands.EDITOR_INSERT_ITALIC,
    DefaultCommands.EDITOR_INSERT_STRIKETHROUGH,
    DefaultCommands.EDITOR_INSERT_INLINE_CODE,
    DefaultCommands.EDITOR_INSERT_LINK,
    DefaultCommands.EDITOR_INSERT_INTERNAL_LINK,
    DefaultCommands.EDITOR_INSERT_IMAGE,
    DefaultCommands.EDITOR_INSERT_CODE_BLOCK,
    DefaultCommands.EDITOR_INSERT_QUOTE,
    DefaultCommands.EDITOR_INSERT_LATEX,
    DefaultCommands.EDITOR_INSERT_BULLET_LIST,
    DefaultCommands.EDITOR_INSERT_NUMERIC_LIST,
    DefaultCommands.EDITOR_INSERT_CHECK_LIST,
    DefaultCommands.EDITOR_INSERT_CHECKBOX,
    DefaultCommands.EDITOR_INSERT_TABLE,
    DefaultCommands.EDITOR_INSERT_HORIZONTAL_RULE,
    DefaultCommands.EDITOR_INSERT_TAG,
    DefaultCommands.EDITOR_INSERT_DATETIME,
    DefaultCommands.EDITOR_INSERT_HTML_BLOCK,
  ],
};

export const usePinnedCommandsStore = defineStore<'pinnedCommands', PinnedCommandsStore>(
  'pinnedCommands',
  () => {
    const commandsByContext = ref<Record<string, CommandName[]>>({ ...DEFAULT_COMMANDS });

    const getCommands = (context: CommandContext): Ref<CommandName[]> => {
      if (!commandsByContext.value[context]) {
        commandsByContext.value[context] = [];
      }
      return computed(() => commandsByContext.value[context] ?? []);
    };

    const addCommand = (context: CommandContext, command: CommandName) => {
      if (!commandsByContext.value[context]) {
        commandsByContext.value[context] = [];
      }
      const commands = commandsByContext.value[context];
      if (commands.includes(command)) {
        return;
      }
      commands.push(command);
    };

    const removeCommand = (context: CommandContext, command: CommandName) => {
      const commands = commandsByContext.value[context];
      if (!commands) {
        return;
      }
      const index = commands.indexOf(command);
      if (index === -1) {
        return;
      }
      commands.splice(index, 1);
    };

    const store: PinnedCommandsStore = {
      getCommands,
      addCommand,
      removeCommand,
    };

    return store;
  },
);
