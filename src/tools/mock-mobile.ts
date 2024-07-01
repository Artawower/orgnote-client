/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuasar } from 'quasar';

export const mockMobile = <T extends (...params: any[]) => any>(
  fn?: T,
  defaultValue?: ReturnType<T>
) => {
  const $q = useQuasar();

  if (!fn) {
    return (() => {}) as () => ReturnType<T>;
  }
  return (...params: Parameters<T>): ReturnType<T> => {
    if ($q.platform.is.nativeMobile) {
      return fn(...params);
    }
    return defaultValue;
  };
};
