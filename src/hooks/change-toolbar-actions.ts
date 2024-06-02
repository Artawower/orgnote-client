import { Command } from 'orgnote-api';
import { useToolbarStore } from 'src/stores/toolbar';
import { ref, onMounted, onUnmounted, Ref, watch } from 'vue';

export const onChangeToolbarActions = (configs: {
  setupMainAction?: () => Command | null;
  setupNewActions?: () => Command[] | null;
  observe?: Ref<unknown>;
}) => {
  const wasTriggered = ref<boolean>(false);
  const toolbarStore = useToolbarStore();

  const trySetupMainAction = (): boolean => {
    const mainAction = configs.setupMainAction?.();
    if (!mainAction) {
      return;
    }
    wasTriggered.value = true;
    toolbarStore.setMainAction(mainAction);
    return true;
  };

  const trySetupBarActions = (): boolean => {
    const actions = configs.setupNewActions?.();
    if (!actions) {
      return;
    }

    wasTriggered.value = true;
    toolbarStore.setActions(actions);
    return true;
  };

  const setupBarActions = () => {
    trySetupMainAction() ?? trySetupBarActions();
  };

  if (configs.observe) {
    watch(() => configs.observe.value, setupBarActions);
  }

  onMounted(setupBarActions);

  onUnmounted(() => {
    if (!wasTriggered.value) {
      return;
    }
    toolbarStore.backToPreviousActions();
  });
};
