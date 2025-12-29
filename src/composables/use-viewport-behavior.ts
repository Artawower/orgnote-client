import { ref, onMounted, onUnmounted } from 'vue';
import { platform } from 'src/utils/platform-detection';

interface ViewportInfo {
  viewportHeight: number;
  keyboardOpened: boolean;
}

type Callback = (info: ViewportInfo) => void;

const isIOSSafari = (): boolean => platform.is.ios && platform.is.safari;

export function useViewportBehavior(cb?: Callback) {
  const viewportHeight = ref<number>(0);
  const keyboardOpened = ref<boolean>(false);
  let rafId = 0;

  const measure = () => {
    const screenHeight = window.visualViewport?.height ?? window.innerHeight;
    const viewportOffsetTop = window.visualViewport?.offsetTop ?? 0;
    viewportHeight.value = screenHeight;
    keyboardOpened.value = Math.abs(window.innerHeight - screenHeight) > 80;

    const singleVh = screenHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${singleVh}px`);
    document.documentElement.style.setProperty('--screen-height', `${screenHeight}px`);
    document.documentElement.style.setProperty('--viewport-offset-top', `${viewportOffsetTop}px`);
    cb?.({ viewportHeight: screenHeight, keyboardOpened: keyboardOpened.value });
  };

  let touchStartY = 0;

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStartY = touch.clientY;
  };

  const findScrollableAncestor = (element: Element): HTMLElement | null => {
    let current: Element | null = element;
    while (current && current !== document.documentElement) {
      if (current instanceof HTMLElement) {
        const { overflowY } = getComputedStyle(current);
        const isScrollable = overflowY === 'auto' || overflowY === 'scroll';
        const hasScrollContent = current.scrollHeight > current.clientHeight;
        if (isScrollable && hasScrollContent) {
          return current;
        }
      }
      current = current.parentElement;
    }
    return null;
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

  const schedule = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      measure();
    });
  };

  onMounted(() => {
    measure();
    window.visualViewport?.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);

    if (isIOSSafari()) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', preventTouchScroll, { passive: false });
    }
  });

  onUnmounted(() => {
    window.visualViewport?.removeEventListener('resize', schedule);
    window.removeEventListener('orientationchange', schedule);

    if (isIOSSafari()) {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', preventTouchScroll);
    }
    cancelAnimationFrame(rafId);
  });

  return { viewportHeight, keyboardOpened };
}
