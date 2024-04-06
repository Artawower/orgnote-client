import { defineStore } from 'pinia';
import { ModalConfig } from 'src/api';
import { VueComponent } from 'src/models';

import { computed, ref, shallowRef } from 'vue';

interface Modal {
  config: ModalConfig;
  component: VueComponent;
}

export const useModalStore = defineStore('modal', () => {
  const opened = ref<boolean>(false);

  const openedComponentStack = shallowRef<Modal[]>([]);

  const open = (
    cmp: VueComponent,
    modalConfig?: ModalConfig = { closable: true }
  ) => {
    const alreadyOpenedIndex = openedComponentStack.value.findIndex(
      (c) => c.component === cmp
    );
    if (alreadyOpenedIndex !== -1) {
      openedComponentStack.value = openedComponentStack.value.slice(
        0,
        alreadyOpenedIndex + 1
      );
      opened.value = true;
      return;
    }

    openedComponentStack.value = [
      ...openedComponentStack.value,
      {
        component: cmp,
        config: modalConfig,
      },
    ];
    opened.value = true;
  };

  const close = () => {
    openedComponentStack.value = openedComponentStack.value.slice(
      0,
      openedComponentStack.value.length - 1
    );
    if (openedComponentStack.value.length === 0) {
      opened.value = false;
    }
  };

  const config = computed(
    () =>
      openedComponentStack.value[openedComponentStack.value.length - 1]?.config
  );

  const component = computed(
    () =>
      openedComponentStack.value[openedComponentStack.value.length - 1]
        ?.component
  );

  const title = computed(() => config.value.title);

  const closeAll = () => {
    openedComponentStack.value = [];
    opened.value = false;
  };

  return {
    open,
    opened,
    title,
    close,
    component,
    config,
    closeAll,
  };
});
