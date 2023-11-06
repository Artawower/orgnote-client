import { useQuasar } from 'quasar';

import { ref, watch } from 'vue';

export const usePlatformSize = () => {
  const $q = useQuasar();

  const iconSize = ref<string>('sm');
  const initIconSize = () => (iconSize.value = $q.screen.gt.sm ? 'xs' : 'sm');
  watch(() => $q.screen.gt.sm, initIconSize);

  initIconSize();

  return {
    iconSize,
  };
};
