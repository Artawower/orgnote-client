/* eslint-disable @typescript-eslint/no-explicit-any */

export const mockServer = <T extends (...params: any[]) => any>(
  fn?: T,
  defaultValue?: ReturnType<T>
) => {
  if (!fn) {
    return (() => {}) as () => ReturnType<T>;
  }
  return (...params: Parameters<T>): ReturnType<T> => {
    if (process.env.CLIENT) {
      return fn(...params);
    }
    return defaultValue;
  };
};
