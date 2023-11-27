import { useAuthStore } from './auth';
import { useFileManagerStore } from './file-manager';
import { useKeybindingStore } from './keybindings';
import { defineStore } from 'pinia';
import { COMMAND } from 'src/hooks';
import { RouteNames } from 'src/router/routes';
import { useRouter } from 'vue-router';

import { computed, ref } from 'vue';

// TODO: master potential API interface for extensions 😊
export interface ToolBarAction {
  name: string;
  icon: string;
  // Show in the sidebar when hidden from toolbar.
  // In other words, always show it somewhere
  permament?: boolean;
  sidebarPosition?: 'top' | 'bottom';
  handler: () => void;
}

export const useToolbarStore = defineStore('toolbarStore', () => {
  const router = useRouter();
  const { executeCommand } = useKeybindingStore();
  const fileManagerStore = useFileManagerStore();
  const invisibleActions = ref<{ [key: string]: ToolBarAction }>({});
  const showToolbar = ref<boolean>(true);

  const actionsStack = ref<ToolBarAction[][]>([
    [
      {
        name: 'toggle sidebar',
        icon: 'menu',
        handler: () => executeCommand({ command: 'toggleActionSidePanel' }),
      },
      {
        name: 'my notes',
        icon: 'home',
        sidebarPosition: 'top',
        handler: () => {
          const authStore = useAuthStore();
          router.push({
            name: RouteNames.UserNotes,
            params: { userId: authStore.user.id },
          });
        },
      },
      {
        name: 'create note',
        permament: true,
        sidebarPosition: 'top',
        icon: 'o_add_box',
        handler: () => fileManagerStore.createFile(),
      },
      {
        name: 'search',
        sidebarPosition: 'top',
        icon: 'search',
        handler: () => executeCommand({ command: COMMAND.openSearch }),
      },
      {
        name: 'execute command',
        sidebarPosition: 'bottom',
        icon: 'terminal',
        handler: () =>
          executeCommand({ command: COMMAND.toggleExecuteCommand }),
      },
    ],
  ]);

  const setActions = (actions: ToolBarAction[]) => {
    movePermanentActionsToSidebar();
    actionsStack.value.push(actions);
  };

  const backToPreviousActions = () => {
    actionsStack.value.pop();
    movePermanentActionsFromSidebar();
  };

  const actions = computed(
    () => actionsStack.value[actionsStack.value.length - 1]
  );

  const allActions = computed(() => [...actions.value]);

  const movePermanentActionsToSidebar = () => {
    const permanentActions = actions.value.filter((action) => action.permament);
    permanentActions.forEach((action) => {
      invisibleActions.value[action.name] = action;
    });
  };

  const movePermanentActionsFromSidebar = () => {
    actions.value.forEach((action) => {
      if (invisibleActions.value[action.name]) {
        delete invisibleActions.value[action.name];
      }
    });
  };

  const hiddenActions = computed(() => Object.values(invisibleActions.value));

  const setAction = (action: ToolBarAction, index: number) => {
    movePermanentActionsToSidebar();
    const newActions = [...actions.value];
    newActions[index] = action;
    actionsStack.value.push(newActions);
  };

  const setMainAction = (action: ToolBarAction) => {
    setAction(action, 2);
  };

  const setAdditionalAction = (action: ToolBarAction) => {
    setAction(action, 1);
  };

  return {
    actions,
    allActions,
    hiddenActions,
    setMainAction,
    setActions,
    backToPreviousActions,
    setAdditionalAction,
    showToolbar,
  };
});
