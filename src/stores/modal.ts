import { defineStore } from 'pinia';
import { VueComponent } from 'src/models';

import { computed, ref, shallowRef } from 'vue';

// TODO: api
export interface ModalConfig {
  closable?: boolean;
  title?: string;
}

export const useModalStore = defineStore('modal', () => {
  const opened = ref<boolean>(false);
  const config = ref<ModalConfig>({ closable: true });

  const component = shallowRef<VueComponent>();

  const open = (cmp: VueComponent, modalConfig?: ModalConfig) => {
    if (modalConfig) {
      config.value = modalConfig;
    }
    if (cmp !== component.value) {
      component.value = cmp;
    }
    opened.value = true;
  };

  const close = () => {
    opened.value = false;
  };

  const title = computed(() => config.value.title);

  return {
    open,
    opened,
    title,
    close,
    component,
    config,
  };
});
