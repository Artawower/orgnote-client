import { useQuasar } from 'quasar';
import { debounce } from 'src/utils/debounce';
import { clientOnly } from 'src/utils/platform-specific';

import type { Ref } from 'vue';
import { watch } from 'vue';
import { onMounted, onUnmounted, ref } from 'vue';

interface ViewportInfo {
  viewportHeight: Ref<number>;
  keyboardOpened: Ref<boolean>;
}

// TODO: feat/stable-beta tests
export function useViewportInfo(cb?: (info: ViewportInfo) => void) {
  const $q = useQuasar();
  const electronOffset = $q.platform.is.electron ? 32 : 0;

  const viewportHeight = ref<number>(process.env.CLIENT ? window.innerHeight - electronOffset : 0);
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
      Math.round(window.innerHeight) !== Math.round(window.visualViewport.height) ||
      window.innerHeight / window.screen.availHeight <= 0.6;

    viewportHeight.value = window.visualViewport.height - electronOffset;
    cb?.(viewportInfo);
  };

  const alignViaVirtualkeyboard = clientOnly(() => {
    if (keyboardOpened.value) {
      window.scrollTo(0, 0);
    }
  });

  const setupKeyboardStatus = clientOnly(() => {
    if (keyboardOpened.value) {
      document.body.classList.add('keyboard-opened');
    } else {
      document.body.classList.remove('keyboard-opened');
    }
  });

  const setupBodyStyles = () => {
    document.body.style.height = `${viewportHeight.value}px`;
    document.body.style.setProperty('--viewport-height', `${viewportHeight.value}px`);
  };

  watch(
    keyboardOpened,
    debounce(() => {
      setupBodyStyles();
      setupKeyboardStatus();
      alignViaVirtualkeyboard();
    }),
  );

  onMounted(() => window.visualViewport.addEventListener('resize', onResize));

  onUnmounted(() => window.visualViewport.removeEventListener('resize', onResize));

  return viewportInfo;
}
