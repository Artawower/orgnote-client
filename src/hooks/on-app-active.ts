import { mockServer } from 'src/tools';
import { onBeforeUnmount, onMounted, ref } from 'vue';

export const onAppActive = (callback?: (active?: boolean) => void) => {
  const active = ref<boolean>(process.env.CLIENT && window.document.hasFocus());

  const focusListener = () => {
    active.value = window.document.hasFocus();
    callback?.(active.value);
  };

  onMounted(mockServer(() => window.addEventListener('focus', focusListener)));

  onBeforeUnmount(
    mockServer(() => window.removeEventListener('focus', focusListener))
  );

  return {
    active,
  };
};
