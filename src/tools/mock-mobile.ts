/* eslint-disable @typescript-eslint/no-explicit-any */

import { Platform } from 'quasar';

export const mockMobile = <T extends (...params: any[]) => any>(
  fn?: T,
  defaultValue?: ReturnType<T> | Promise<ReturnType<T>>
) => {
  if (!fn) {
    return (() => defaultValue) as () => ReturnType<T> | Promise<ReturnType<T>>;
  }
  return async (...params: Parameters<T>): Promise<ReturnType<T>> => {
    if (process.env.CLIENT && Platform.is.nativeMobile) {
      return await fn(...params);
    }
    return defaultValue;
  };
};

export const mockAndroid = <T extends (...params: any[]) => any>(
  fn?: T,
  defaultValue?: ReturnType<T> | Promise<ReturnType<T>>
) => {
  if (!fn) {
    return (() => defaultValue) as () => ReturnType<T> | Promise<ReturnType<T>>;
  }
  return async (...params: Parameters<T>): Promise<ReturnType<T>> => {
    if (process.env.CLIENT && Platform.is.nativeMobile && Platform.is.android) {
      return await fn(...params);
    }
    return defaultValue;
  };
};
