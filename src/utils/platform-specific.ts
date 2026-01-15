import type { PlatformSpecificFn } from 'orgnote-api';
import { Platform } from 'quasar';

type Condition = () => boolean;

const isAsyncFn = (fn?: unknown): boolean => {
  if (!fn || typeof fn !== 'function') return false;
  return fn.constructor.name === 'AsyncFunction';
};

export const platformSpecific = (condition: Condition): PlatformSpecificFn => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <T extends (...params: any[]) => any>(fn?: T, defaultValue?: Awaited<ReturnType<T>>) => {
    const isAsync = isAsyncFn(fn);

    return (...params: Parameters<T>): ReturnType<T> => {
      if (fn && condition()) {
        return fn(...params);
      }
      return (isAsync ? Promise.resolve(defaultValue) : defaultValue) as ReturnType<T>;
    };
  };
};

export const androidOnly = platformSpecific(
  () => !!process.env.CLIENT && Platform.is.nativeMobile && Platform.is.android,
);
export const clientOnly = platformSpecific(() => !!process.env.CLIENT);
export const serverOnly = platformSpecific(() => !process.env.CLIENT);
export const mobileOnly = platformSpecific(() => !!process.env.CLIENT && Platform.is.mobile);
export const iosOnly = platformSpecific(
  () => !!process.env.CLIENT && Platform.is.nativeMobile && Platform.is.ios,
);
export const nativeMobileOnly = platformSpecific(
  () => !!process.env.CLIENT && Platform.is.nativeMobile,
);
export const desktopOnly = platformSpecific(() => !Platform.is.mobile && !!process.env.CLIENT);
export const electronOnly = platformSpecific(() => Platform.is.electron);
