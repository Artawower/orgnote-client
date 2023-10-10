import { defineStore } from 'pinia';
import { createPromise } from 'src/tools';

import { ref } from 'vue';

export const useConfirmationModalStore = defineStore(
  'confirmationModal',
  () => {
    const title = ref<string>();
    const description = ref<string>();
    const opened = ref<boolean>(false);
    const resolveConfirmation = ref<(data?: boolean) => void>();

    const confirm = async (dialogTitle: string, dialogMessage: string) => {
      title.value = dialogTitle;
      description.value = dialogMessage;
      opened.value = true;
      const [promise, resolver] = createPromise<boolean>();
      resolveConfirmation.value = resolver;
      return promise.finally(() => resetModal());
    };

    const resetModal = () => {
      title.value = null;
      description.value = null;
      opened.value = false;
      resolveConfirmation.value = null;
    };

    return {
      confirm,
      title,
      description,
      opened,
      resolveConfirmation,
    };
  }
);
