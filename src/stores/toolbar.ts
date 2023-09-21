import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';
import { COMMAND } from 'src/hooks';
import { useKeybindingStore } from './keybindings';
import { useAuthStore } from './auth';
import { useFileManagerStore } from './file-manager';

// TODO: master potential API interface for extensions 😊
export interface ToolBarAction {
  name: string;
  icon: string;
  sidebarPosition?: 'top' | 'bottom';
  handler: () => void;
}

export const useToolbarStore = defineStore('toolbarStore', () => {
  const router = useRouter();
  const { executeCommand } = useKeybindingStore();
  const fileManagerStore = useFileManagerStore();

  const actionsStack = ref<ToolBarAction[][]>([
    [
      {
        name: 'toggle sidebar',
        icon: 'menu_open',
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
        sidebarPosition: 'top',
        icon: 'add',
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
    actionsStack.value.push(actions);
  };

  const backToPreviousActions = () => {
    actionsStack.value.pop();
  };

  const actions = computed(
    () => actionsStack.value[actionsStack.value.length - 1]
  );

  const setMainAction = (action: ToolBarAction) => {
    const middleIndex = 2;
    const newActions = [...actions.value];
    newActions[middleIndex] = action;
    actionsStack.value.push(newActions);
  };

  return {
    actions,
    setMainAction,
    setActions,
    backToPreviousActions,
  };
});
