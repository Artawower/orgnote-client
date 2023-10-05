import { useQuasar } from 'quasar';

import { Ref, onMounted, onUnmounted, ref } from 'vue';

interface ViewportInfo {
  viewportHeight: Ref<number>;
  keyboardOpened: Ref<boolean>;
}

export function onMobileViewportChanged(cb?: (info: ViewportInfo) => void) {
  const viewportHeight = ref<number>(window.innerHeight);
  const keyboardOpened = ref<boolean>(false);

  const $q = useQuasar();

  const viewportInfo: ViewportInfo = {
    viewportHeight,
    keyboardOpened,
  };

  if (!$q.platform.is.mobile || !window.visualViewport) {
    return viewportInfo;
  }

  const onResize = () => {
    keyboardOpened.value =
      Math.round(window.innerHeight) !==
        Math.round(window.visualViewport.height) ||
      window.innerHeight / window.screen.availHeight <= 0.6;

    viewportHeight.value = window.visualViewport.height;
    cb?.(viewportInfo);
  };

  onMounted(() => window.visualViewport.addEventListener('resize', onResize));

  onUnmounted(() =>
    window.visualViewport.removeEventListener('resize', onResize)
  );

  return viewportInfo;
}
