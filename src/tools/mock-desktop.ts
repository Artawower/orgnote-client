/* eslint-disable @typescript-eslint/no-explicit-any */

import { Platform } from 'quasar';

// TODO: rename, add support for async function
export const mockDesktop = <T extends (...params: any[]) => any>(
  fn?: T,
  defaultValue?: ReturnType<T>
) => {
  if (!fn) {
    return (() => {}) as () => ReturnType<T>;
  }
  return (...params: Parameters<T>): ReturnType<T> => {
    if (!Platform.is.mobile && process.env.CLIENT) {
      return fn(...params);
    }
    return defaultValue;
  };
};
