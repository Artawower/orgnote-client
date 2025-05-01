import { ref, onMounted, onUnmounted } from 'vue';

interface ViewportInfo {
  viewportHeight: number;
  keyboardOpened: boolean;
}

type Callback = (info: ViewportInfo) => void;

export function useViewportDetector(cb?: Callback) {
  const viewportHeight = ref<number>(0);
  const keyboardOpened = ref<boolean>(false);
  let rafId = 0;

  const measure = () => {
    const screenHeight = window.visualViewport?.height ?? window.innerHeight;
    viewportHeight.value = screenHeight;
    keyboardOpened.value = Math.abs(window.innerHeight - screenHeight) > 80;

    const singleVh = screenHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${singleVh}px`);
    document.documentElement.style.setProperty('--screen-height', `${screenHeight}px`);
    cb?.({ viewportHeight: screenHeight, keyboardOpened: keyboardOpened.value });
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
  });

  onUnmounted(() => {
    window.visualViewport?.removeEventListener('resize', schedule);
    window.removeEventListener('orientationchange', schedule);
    cancelAnimationFrame(rafId);
  });

  return { viewportHeight, keyboardOpened };
}
