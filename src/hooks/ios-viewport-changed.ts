import { useQuasar } from 'quasar';

import { onMounted, onUnmounted, ref } from 'vue';

export function onIosViewportChanged(
  cb?: (height: number, width: number) => void
) {
  const viewportHeight = ref<number>(window.innerHeight);

  const $q = useQuasar();

  const viewportSize = {
    viewportHeight,
  } as const;

  if (!$q.platform.is.ios || !window.visualViewport) {
    return viewportSize;
  }

  const onResize = () => {
    cb?.(window.visualViewport.height, window.visualViewport.width);
    viewportHeight.value = window.visualViewport.height;
  };

  onMounted(() => window.visualViewport.addEventListener('resize', onResize));

  onUnmounted(() =>
    window.visualViewport.removeEventListener('resize', onResize)
  );

  return viewportSize;
}
