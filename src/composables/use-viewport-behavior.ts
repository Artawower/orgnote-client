import { ref, onMounted, onUnmounted } from 'vue';
import { platform, platformMatch } from 'src/utils/platform-detection';
import { to } from 'orgnote-api/utils';

interface ViewportInfo {
  viewportHeight: number;
  keyboardOpened: boolean;
}

type Callback = (info: ViewportInfo) => void;

const KEYBOARD_HEIGHT_THRESHOLD = 80;
const VH_MULTIPLIER = 0.01;

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

const updateCssVariables = (screenHeight: number, viewportOffsetTop: number): void => {
  const singleVh = screenHeight * VH_MULTIPLIER;
  document.documentElement.style.setProperty('--vh', `${singleVh}px`);
  document.documentElement.style.setProperty('--screen-height', `${screenHeight}px`);
  document.documentElement.style.setProperty('--viewport-offset-top', `${viewportOffsetTop}px`);
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
    const touchY = touch.clientY;
    const deltaY = touchStartY - touchY;
    const { scrollTop, scrollHeight, clientHeight } = scrollableElement;

    const isAtTop = scrollTop <= 0 && deltaY < 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight && deltaY > 0;

    if (isAtTop || isAtBottom) {
      e.preventDefault();
    }
  };

  return { handleTouchStart, preventTouchScroll };
};

export function useViewportBehavior(cb?: Callback) {
  const isIOSSafari = platform.is.ios && platform.is.safari;
  const viewportHeight = ref<number>(0);
  const keyboardOpened = ref<boolean>(false);
  let rafId = 0;
  let keyboardShowListener: { remove: () => Promise<void> } | null = null;
  let keyboardHideListener: { remove: () => Promise<void> } | null = null;

  const { handleTouchStart, preventTouchScroll } = createTouchScrollPreventer();

  const setKeyboardOpened = (opened: boolean) => {
    keyboardOpened.value = opened;
    document.body.classList.toggle('keyboard-opened', opened);
  };

  const measure = () => {
    const screenHeight = window.visualViewport?.height ?? window.innerHeight;
    const viewportOffsetTop = window.visualViewport?.offsetTop ?? 0;
    viewportHeight.value = screenHeight;

    if (!platform.is.capacitor) {
      const opened = Math.abs(window.innerHeight - screenHeight) > KEYBOARD_HEIGHT_THRESHOLD;
      setKeyboardOpened(opened);
    }

    updateCssVariables(screenHeight, viewportOffsetTop);
    cb?.({ viewportHeight: screenHeight, keyboardOpened: keyboardOpened.value });
  };

  const schedule = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      measure();
    });
  };

  const setupCapacitorKeyboard = async () => {
    const keyboardModule = await to(() => import('@capacitor/keyboard'))();
    if (keyboardModule.isErr()) return;

    const { Keyboard } = keyboardModule.value;
    keyboardShowListener = await Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardOpened(true);
    });
    keyboardHideListener = await Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardOpened(false);
    });
  };

  onMounted(() => {
    measure();
    window.visualViewport?.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);

    platformMatch({
      capacitor: setupCapacitorKeyboard,
      default: () => {},
    });

    if (isIOSSafari) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', preventTouchScroll, { passive: false });
    }
  });

  onUnmounted(() => {
    window.visualViewport?.removeEventListener('resize', schedule);
    window.removeEventListener('orientationchange', schedule);

    if (isIOSSafari) {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', preventTouchScroll);
    }

    keyboardShowListener?.remove();
    keyboardHideListener?.remove();

    cancelAnimationFrame(rafId);
  });

  return { viewportHeight, keyboardOpened };
}
