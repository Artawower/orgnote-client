import type { PlatformSpecificFn } from 'orgnote-api';
import { Platform } from 'quasar';

type Condition = () => boolean;

export const platformSpecific = (condition: Condition): PlatformSpecificFn => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <T extends (...params: any[]) => any>(
    fn?: T,
    defaultValue?: ReturnType<T> | Promise<ReturnType<T>>,
  ) => {
    return (...params: Parameters<T>): ReturnType<T> | Promise<ReturnType<T>> => {
      if (fn && condition()) {
        return fn(...params) as ReturnType<T>;
      }
      return defaultValue as ReturnType<T>;
    };
  };
};

export const androidOnly = platformSpecific(
  () => process.env.CLIENT && Platform.is.nativeMobile && Platform.is.android,
);
export const clientOnly = platformSpecific(() => !!process.env.CLIENT);
export const serverOnly = platformSpecific(() => !process.env.CLIENT);
export const mobileOnly = platformSpecific(() => process.env.CLIENT && Platform.is.nativeMobile);
export const desktopOnly = platformSpecific(() => !Platform.is.mobile && !!process.env.CLIENT);
