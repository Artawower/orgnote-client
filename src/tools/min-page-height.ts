import { useQuasar } from 'quasar';

export function resetPageMinHeight(): Record<string, string> {
  const $q = useQuasar();
  if ($q.platform.is.desktop) {
    return;
  }
  return {
    minHeight: '0',
  };
}
