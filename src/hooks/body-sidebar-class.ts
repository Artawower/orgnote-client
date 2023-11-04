import { useSidebarStore } from 'src/stores';

import { watch } from 'vue';

const sidebarOpenedClass = 'sidebar-opened';

export const useBodySidebarClass = () => {
  const sidebarStore = useSidebarStore();
  watch(
    () => sidebarStore.opened,
    (val) => {
      if (val) {
        document.body.classList.add(sidebarOpenedClass);
        return;
      }
      document.body.classList.remove(sidebarOpenedClass);
    }
  );
};
