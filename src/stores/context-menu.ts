import type { MenuAction, MenuGroup, MenuGroupParams } from 'orgnote-api';
import { DefaultCommands } from 'orgnote-api';
import { defineStore } from 'pinia';
import { reactive } from 'vue';

const DEFAULT_FILE_ACTIONS: MenuAction[] = [
  { command: DefaultCommands.CREATE_NOTE },
  { command: DefaultCommands.RENAME_FILE },
  { command: DefaultCommands.COPY_FILE },
  { command: DefaultCommands.MOVE_FILE },
  { command: DefaultCommands.DELETE_FILE },
  { command: DefaultCommands.SELECT_FILE },
];

const DEFAULT_DIR_ACTIONS: MenuAction[] = [
  { command: DefaultCommands.CREATE_FOLDER },
  { command: DefaultCommands.CREATE_NOTE },
  { command: DefaultCommands.RENAME_FILE },
  { command: DefaultCommands.COPY_FILE },
  { command: DefaultCommands.MOVE_FILE },
  { command: DefaultCommands.DELETE_FILE },
  { command: DefaultCommands.SELECT_FILE },
];

const DEFAULT_GROUPS: Record<MenuGroup, MenuGroupParams> = {
  file: { items: DEFAULT_FILE_ACTIONS },
  dir: { items: DEFAULT_DIR_ACTIONS },
  tab: { items: [] },
};

export const useContextMenuStore = defineStore('contextMenu', () => {
  const groups = reactive<Map<string, MenuGroupParams>>(new Map(Object.entries(DEFAULT_GROUPS)));

  const registerGroup = (group: string) => {
    if (groups.has(group)) {
      return;
    }
    groups.set(group, { items: [] });
  };

  const updateContextGroup = (group: string, params: MenuGroupParams) => {
    groups.set(group, params);
  };

  const addContextMenuAction = (group: string, action: MenuAction) => {
    const groupParams = groups.get(group);
    if (!groupParams) {
      groups.set(group, { items: [action] });
      return;
    }
    groupParams.items.push(action);
  };

  const removeContextMenuAction = (group: string, action: MenuAction) => {
    const groupParams = groups.get(group);
    if (!groupParams) {
      return;
    }
    const index = groupParams.items.indexOf(action);
    if (index !== -1) {
      groupParams.items.splice(index, 1);
    }
  };

  const getContextMenuActions = (group: string): MenuAction[] => {
    return groups.get(group)?.items ?? [];
  };

  const store = {
    registerGroup,
    updateContextGroup,
    addContextMenuAction,
    removeContextMenuAction,
    getContextMenuActions,
  };

  return store;
});
