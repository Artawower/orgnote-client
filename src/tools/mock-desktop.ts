/* eslint-disable @typescript-eslint/no-explicit-any */

import { useQuasar } from 'quasar';

export const mockDesktop = <T extends (...params: any[]) => any>(
  fn?: T,
  defaultValue?: ReturnType<T>
) => {
  const $q = useQuasar();

  if (!fn) {
    return (() => {}) as () => ReturnType<T>;
  }
  return (...params: Parameters<T>): ReturnType<T> => {
    if (!$q.platform.is.mobile && process.env.CLIENT) {
      return fn(...params);
    }
    return defaultValue;
  };
};
