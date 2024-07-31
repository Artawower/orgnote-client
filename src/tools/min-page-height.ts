import { useQuasar } from 'quasar';

// TODO: remove. Also delete quasar's pages
export function resetPageMinHeight(): Record<string, string> {
  const $q = useQuasar();
  if ($q && $q.platform.is.desktop) {
    return;
  }
  return {
    minHeight: '0',
  };
}
