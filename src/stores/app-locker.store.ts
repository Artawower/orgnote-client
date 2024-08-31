import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

// TODO: feat/native-file-sync stack
export const useAppLockerStore = defineStore(
  'app-locker',
  () => {
    const locked = ref<boolean>(false);

    const doneTasksCount = ref<number>();
    const totalTasksCount = ref<number>();
    const title = ref<string>();
    const description = ref<string>();

    const percents = computed(
      () =>
        doneTasksCount.value &&
        totalTasksCount.value &&
        Math.floor((doneTasksCount.value / totalTasksCount.value) * 100)
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const unlock = (_lockId: string): void => {
      locked.value = false;

      doneTasksCount.value = null;
      totalTasksCount.value = null;
      title.value = null;
      description.value = null;
    };

    return {
      locked,
      doneTasksCount,
      totalTasksCount,
      title,
      description,
      percents,
      unlock,
    };
  },
  { persist: true }
);
