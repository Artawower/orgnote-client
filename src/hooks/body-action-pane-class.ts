import { onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';

const actionPaneOpened = 'action-pane-opened';
const openedActionCount = ref<number>(0);

watch(
  () => openedActionCount.value,
  (cur, prev) => {
    if (cur > 0 && prev === 0) {
      document.body.classList.add(actionPaneOpened);
      return;
    }
    if (cur === 0 && prev > 0) {
      document.body.classList.remove(actionPaneOpened);
    }
  }
);

export const useBodyActionPaneClass = () => {
  onBeforeMount(() => {
    openedActionCount.value += 1;
  });
  onBeforeUnmount(() => {
    openedActionCount.value -= 1;
  });
};
