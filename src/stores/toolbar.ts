import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';
import { COMMAND } from 'src/hooks';
import { useKeybindingStore } from './keybindings';
import { useAuthStore } from './auth';

// TODO: master potential API interface for extensions 😊
export interface ToolBarAction {
  name: string;
  icon: string;
  handler: () => void;
}

export const useToolbarStore = defineStore('toolbarStore', () => {
  const router = useRouter();
  const { executeCommand } = useKeybindingStore();

  const actionsStack = ref<ToolBarAction[][]>([
    [
      {
        name: 'toggle sidebar',
        icon: 'arrow_circle_right',
        handler: () => executeCommand({ command: 'toggleLeftBar' }),
      },
      {
        name: 'my notes',
        icon: 'feed',
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
        icon: 'add',
        handler: () => router.push({ name: RouteNames.EditNote }),
      },
      {
        name: 'search',
        icon: 'search',
        handler: () => executeCommand({ command: COMMAND.openSearch }),
      },
      {
        name: 'execute command',
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
