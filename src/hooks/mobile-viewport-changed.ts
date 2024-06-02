import { useQuasar } from 'quasar';

import { Ref, onMounted, onUnmounted, ref } from 'vue';

interface ViewportInfo {
  viewportHeight: Ref<number>;
  keyboardOpened: Ref<boolean>;
}

export function onMobileViewportChanged(cb?: (info: ViewportInfo) => void) {
  const $q = useQuasar();
  const electronOffset = $q.platform.is.electron ? 32 : 0;
  const viewportHeight = ref<number>(
    process.env.CLIENT ? window.innerHeight - electronOffset : 0
  );
  const keyboardOpened = ref<boolean>(false);

  const viewportInfo: ViewportInfo = {
    viewportHeight,
    keyboardOpened,
  };

  if (!process.env.CLIENT || !$q.platform.is.mobile || !window.visualViewport) {
    return viewportInfo;
  }

  const onResize = () => {
    keyboardOpened.value =
      Math.round(window.innerHeight) !==
        Math.round(window.visualViewport.height) ||
      window.innerHeight / window.screen.availHeight <= 0.6;

    viewportHeight.value = window.visualViewport.height - electronOffset;
    cb?.(viewportInfo);
  };

  onMounted(() => window.visualViewport.addEventListener('resize', onResize));

  onUnmounted(() =>
    window.visualViewport.removeEventListener('resize', onResize)
  );

  return viewportInfo;
}
