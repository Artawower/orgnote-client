import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { shallowRef } from 'vue';
import { Command } from 'orgnote-api';
import { useOrgNoteApiStore } from './orgnote-api.store';

export const useToolbarStore = defineStore('toolbarStore', () => {
  const { orgNoteApi } = useOrgNoteApiStore();
  const invisibleActions = ref<{ [key: string]: Command }>({});

  const showToolbar = ref<boolean>(true);
  const toolbarActions = shallowRef<Command[]>(
    [
      orgNoteApi.commands.get('toggle file manager'),
      orgNoteApi.commands.get('my notes'),
      orgNoteApi.commands.get('create note'),
      orgNoteApi.commands.get('search'),
      orgNoteApi.commands.get('dashboard'),
      orgNoteApi.commands.get('note list'),
      orgNoteApi.commands.get('edit mode'),
      orgNoteApi.commands.get('view mode'),
      orgNoteApi.commands.get('graph'),
      orgNoteApi.commands.get('extensions'),
      orgNoteApi.commands.get('toggle debug'),
    ].filter((c: Command) => !!c)
  );
  const systemActions = shallowRef<Command[]>([
    orgNoteApi.commands.get('settings'),
    orgNoteApi.commands.get('project info'),
    orgNoteApi.commands.get('toggle sidebar'),
  ]);

  const visibleToolbarActions = computed(() =>
    toolbarActions.value.filter((a) => a.available?.())
  );

  const actionsStack = ref<Command[][]>([
    [
      orgNoteApi.commands.get('toggle sidebar'),
      orgNoteApi.commands.get('my notes'),
      orgNoteApi.commands.get('create note'),
      orgNoteApi.commands.get('search'),
      orgNoteApi.commands.get('toggle commands'),
    ],
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
