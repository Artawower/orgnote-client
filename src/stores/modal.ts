import type { Modal, ModalConfig, ModalStore, VueComponent } from 'orgnote-api';
import { defineStore } from 'pinia';
import { createPromise } from 'src/utils/create-promise';
import { computed, shallowRef } from 'vue';

export const useModalStore = defineStore<'modal', ModalStore>('modal', () => {
  const modals = shallowRef<Modal[]>([]);
  const resolvers: Array<() => void> = [];

  const open = (cmp: VueComponent, modalConfig: ModalConfig = { closable: true }) => {
    const alreadyOpenedIndex = modals.value.findIndex((c) => c.component === cmp);
    if (alreadyOpenedIndex !== -1) {
      modals.value = modals.value.slice(0, alreadyOpenedIndex + 1);
      return modals.value[alreadyOpenedIndex]?.closed;
    }

    const [p, resolver] = createPromise<void>();
    resolvers.push(resolver);

    modals.value = [
      ...modals.value,
      {
        component: cmp,
        closed: p,
        config: modalConfig,
      },
    ];

    return p;
  };

  const close = () => {
    modals.value = modals.value.slice(0, modals.value.length - 1);
    resolvers.pop()?.();
  };

  const config = computed(() => modals.value[modals.value.length - 1]?.config);

  const component = computed(() => modals.value[modals.value.length - 1]?.component);

  const title = computed(() => config.value?.title);

  const closeAll = () => {
    modals.value = [];
  };

  const updateConfig = (newConfig: Partial<ModalConfig>) => {
    modals.value = [
      ...modals.value.slice(0, -1),
      {
        ...modals.value[modals.value.length - 1],
        config: {
          ...modals.value[modals.value.length - 1].config,
          ...newConfig,
        },
      },
    ];
  };

  const store: ModalStore = {
    open,
    title,
    close,
    modals,
    component,
    config,
    closeAll,
    updateConfig,
  };

  return store;
});
