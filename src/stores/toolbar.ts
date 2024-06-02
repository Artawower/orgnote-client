import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { shallowRef } from 'vue';
import { Command, DefaultCommands as C } from 'orgnote-api';
import { useOrgNoteApiStore } from './orgnote-api.store';
import { useCommandsStore } from './commands';
import { watch } from 'vue';
import { onMounted } from 'vue';

export const useToolbarStore = defineStore('toolbarStore', () => {
  const { orgNoteApi } = useOrgNoteApiStore();
  const invisibleActions = ref<{ [key: string]: Command }>({});

  const showToolbar = ref<boolean>(true);
  const toolbarActions = shallowRef<Command[]>([]);
  const systemActions = shallowRef<Command[]>();

  const initToolbarActions = () => {
    toolbarActions.value = [
      orgNoteApi.commands.get(C.TOGGLE_FILE_MANAGER),
      orgNoteApi.commands.get(C.OPEN_MY_NOTES),
      orgNoteApi.commands.get(C.CREATE_NOTE),
      orgNoteApi.commands.get(C.SEARCH),
      orgNoteApi.commands.get(C.OPEN_DASHBOARD),
      orgNoteApi.commands.get(C.OPEN_PUBLIC_NOTE_LIST),
      orgNoteApi.commands.get(C.OPEN_NOTE_EDITOR),
      orgNoteApi.commands.get(C.OPEN_NOTE_VIEWER),
      orgNoteApi.commands.get(C.OPEN_GRAPH),
      orgNoteApi.commands.get(C.OPEN_EXTENSIONS),
      orgNoteApi.commands.get(C.TOGGLE_DEBUG_MODE),
    ].filter((c: Command) => !!c);
  };

  const initSystemActions = () => {
    systemActions.value = [
      orgNoteApi.commands.get(C.TOGGLE_COMMANDS),
      orgNoteApi.commands.get(C.SETTINGS),
      orgNoteApi.commands.get(C.PROJECT_INFO),
      orgNoteApi.commands.get(C.TOGGLE_SIDEBAR),
    ].filter((c: Command) => !!c);
  };

  const commandStore = useCommandsStore();

  watch(
    () => commandStore.commands.length,
    () => {
      initToolbarActions();
      initSystemActions();
    }
  );

  onMounted(() => {
    initToolbarActions();
    initSystemActions();
  });

  const visibleToolbarActions = computed(() =>
    toolbarActions.value.filter((a) => a.available?.())
  );

  const actionsStack = ref<Command[][]>([
    [
      orgNoteApi.commands.get(C.TOGGLE_SIDEBAR),
      orgNoteApi.commands.get(C.OPEN_MY_NOTES),
      orgNoteApi.commands.get(C.CREATE_NOTE),
      orgNoteApi.commands.get(C.SEARCH),
      orgNoteApi.commands.get(C.TOGGLE_COMMANDS),
    ].filter((c: Command) => !!c),
  ]);

  const setActions = (actions: Command[]) => {
    actionsStack.value.push(actions);
  };

  const backToPreviousActions = () => {
    actionsStack.value.pop();
  };

  const actions = computed(
    () => actionsStack.value[actionsStack.value.length - 1]
  );

  const allActions = computed(() => [...actions.value]);

  const hiddenActions = computed(() => Object.values(invisibleActions.value));

  const setAction = (action: Command, index: number) => {
    const newActions = [...actions.value];
    newActions[index] = action;
    actionsStack.value.push(newActions);
  };

  const setMainAction = (action: Command) => {
    setAction(action, 2);
  };

  const setAdditionalAction = (action: Command) => {
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
    toolbarActions,
    systemActions,
    visibleToolbarActions,
  };
});
