import { onBeforeUnmount, onMounted, ref } from 'vue';

export const onAppActive = (callback?: (active?: boolean) => void) => {
  const active = ref<boolean>(process.env.CLIENT && window.document.hasFocus());

  const focusListener = () => {
    active.value = window.document.hasFocus();
    callback?.(active.value);
  };

  onMounted(
    () => process.env.CLIENT && window.addEventListener('focus', focusListener)
  );

  onBeforeUnmount(
    () =>
      process.env.CLIENT && window.removeEventListener('focus', focusListener)
  );

  return {
    active,
  };
};
