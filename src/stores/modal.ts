import type { Modal, ModalConfig, ModalStore, VueComponent } from 'orgnote-api';
import { defineStore } from 'pinia';
import { computed, shallowRef } from 'vue';

export const useModalStore = defineStore<'modal', ModalStore>('modal', () => {
  const modals = shallowRef<Modal[]>([]);

  const open = (cmp: VueComponent, modalConfig: ModalConfig = { closable: true }) => {
    const alreadyOpenedIndex = modals.value.findIndex((c) => c.component === cmp);
    if (alreadyOpenedIndex !== -1) {
      modals.value = modals.value.slice(0, alreadyOpenedIndex + 1);
      return;
    }

    modals.value = [
      ...modals.value,
      {
        component: cmp,
        config: modalConfig,
      },
    ];
  };

  const close = () => {
    modals.value = modals.value.slice(0, modals.value.length - 1);
  };

  const config = computed(() => modals.value[modals.value.length - 1]?.config);

  const component = computed(() => modals.value[modals.value.length - 1]?.component);

  const title = computed(() => config.value?.title);

  const closeAll = () => {
    modals.value = [];
  };

  return {
    open,
    title,
    close,
    modals,
    component,
    config,
    closeAll,
  };
});
