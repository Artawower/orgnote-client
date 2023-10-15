import { onBeforeUnmount, onMounted, ref } from 'vue';

export const onAppActive = (callback?: (active?: boolean) => void) => {
  const active = ref<boolean>(window.document.hasFocus());

  const focusListener = () => {
    active.value = window.document.hasFocus();
    callback?.(active.value);
  };

  onMounted(() => window.addEventListener('focus', focusListener));

  onBeforeUnmount(() => window.removeEventListener('focus', focusListener));

  return {
    active,
  };
};
