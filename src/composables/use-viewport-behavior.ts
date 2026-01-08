import { ref, onMounted, onUnmounted, readonly, type Ref } from 'vue';
import { platform, platformMatch } from 'src/utils/platform-detection';
import { to } from 'orgnote-api/utils';

interface ViewportInfo {
  viewportHeight: number;
  keyboardOpened: boolean;
}

type ViewportCallback = (info: ViewportInfo) => void;

const KEYBOARD_HEIGHT_THRESHOLD = 80;
const VH_MULTIPLIER = 0.01;

const globalKeyboardOpened = ref(false);

export function useKeyboardState(): { keyboardOpened: Readonly<Ref<boolean>> } {
  return { keyboardOpened: readonly(globalKeyboardOpened) };
}

const setKeyboardOpened = (opened: boolean, localRef: Ref<boolean>): void => {
  globalKeyboardOpened.value = opened;
  localRef.value = opened;
  document.body.classList.toggle('keyboard-opened', opened);
};

const updateCssVariables = (screenHeight: number, viewportOffsetTop: number): void => {
  const singleVh = screenHeight * VH_MULTIPLIER;
  document.documentElement.style.setProperty('--vh', `${singleVh}px`);
  document.documentElement.style.setProperty('--screen-height', `${screenHeight}px`);
  document.documentElement.style.setProperty('--viewport-offset-top', `${viewportOffsetTop}px`);
};

const findScrollableAncestor = (element: Element | null): HTMLElement | null => {
  if (!element || element === document.documentElement) return null;

  if (element instanceof HTMLElement) {
    const { overflowY } = getComputedStyle(element);
    const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
    if (isScrollable && element.scrollHeight > element.clientHeight) {
      return element;
    }
  }

  return findScrollableAncestor(element.parentElement);
};

const createTouchScrollPreventer = () => {
  let touchStartY = 0;

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartY = touch.clientY;
  };

  const preventTouchScroll = (e: TouchEvent) => {
    const target = e.target;
    if (!(target instanceof Element)) return;

    const scrollableElement = findScrollableAncestor(target);

    if (!scrollableElement) {
      e.preventDefault();
      return;
    }

    const touch = e.touches[0];
    if (!touch) return;
    const deltaY = touchStartY - touch.clientY;
    const { scrollTop, scrollHeight, clientHeight } = scrollableElement;

    const isAtTop = scrollTop <= 0 && deltaY < 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight && deltaY > 0;

    if (isAtTop || isAtBottom) {
      e.preventDefault();
    }
  };

  return { handleTouchStart, preventTouchScroll };
};

const createViewportMeasurer = (
  viewportHeight: Ref<number>,
  keyboardOpened: Ref<boolean>,
  cb?: ViewportCallback,
) => {
  return () => {
    const screenHeight = window.visualViewport?.height ?? window.innerHeight;
    const viewportOffsetTop = window.visualViewport?.offsetTop ?? 0;
    viewportHeight.value = screenHeight;

    if (!platform.is.capacitor) {
      const opened = Math.abs(window.innerHeight - screenHeight) > KEYBOARD_HEIGHT_THRESHOLD;
      setKeyboardOpened(opened, keyboardOpened);
    }

    updateCssVariables(screenHeight, viewportOffsetTop);
    cb?.({ viewportHeight: screenHeight, keyboardOpened: keyboardOpened.value });
  };
};

const createScheduler = (measureFn: () => void) => {
  let rafId = 0;

  const schedule = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      measureFn();
    });
  };

  const cancel = () => cancelAnimationFrame(rafId);

  return { schedule, cancel };
};

const setupCapacitorKeyboardListeners = async (keyboardOpened: Ref<boolean>) => {
  const keyboardModule = await to(() => import('@capacitor/keyboard'))();
  if (keyboardModule.isErr()) return { cleanup: () => {} };

  const { Keyboard } = keyboardModule.value;
  const showListener = await Keyboard.addListener('keyboardWillShow', () => {
    setKeyboardOpened(true, keyboardOpened);
  });
  const hideListener = await Keyboard.addListener('keyboardWillHide', () => {
    setKeyboardOpened(false, keyboardOpened);
  });

  return {
    cleanup: () => {
      showListener.remove();
      hideListener.remove();
    },
  };
};

const setupIOSSafariScrollFix = () => {
  const { handleTouchStart, preventTouchScroll } = createTouchScrollPreventer();

  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', preventTouchScroll, { passive: false });

  return () => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', preventTouchScroll);
  };
};

export function useViewportBehavior(cb?: ViewportCallback) {
  const isIOSSafari = platform.is.ios && platform.is.safari;
  const viewportHeight = ref<number>(0);
  const keyboardOpened = ref<boolean>(false);

  const measure = createViewportMeasurer(viewportHeight, keyboardOpened, cb);
  const { schedule, cancel: cancelScheduler } = createScheduler(measure);

  let capacitorCleanup: (() => void) | undefined;
  let safariCleanup: (() => void) | undefined;

  onMounted(() => {
    measure();
    window.visualViewport?.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);

    platformMatch({
      capacitor: async () => {
        const result = await setupCapacitorKeyboardListeners(keyboardOpened);
        capacitorCleanup = result.cleanup;
      },
      default: () => {},
    });

    if (isIOSSafari) {
      safariCleanup = setupIOSSafariScrollFix();
    }
  });

  onUnmounted(() => {
    window.visualViewport?.removeEventListener('resize', schedule);
    window.removeEventListener('orientationchange', schedule);
    safariCleanup?.();
    capacitorCleanup?.();
    cancelScheduler();
  });

  return { viewportHeight, keyboardOpened };
}
