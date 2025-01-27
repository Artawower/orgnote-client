import { test, expect, vi } from 'vitest';
import {
  androidOnly,
  clientOnly,
  serverOnly,
  mobileOnly,
  desktopOnly,
  nativeMobileOnly,
} from './platform-specific';
import { Platform } from 'quasar';

vi.mock('quasar', () => ({
  Platform: {
    is: {
      nativeMobile: false,
      android: false,
      mobile: false,
    },
  },
}));

test('androidOnly executes fn only on Android platform', async () => {
  process.env.CLIENT = 'true';
  Platform.is.nativeMobile = true;
  Platform.is.android = true;

  const mockFn = vi.fn(() => 'Android only');
  const result = await androidOnly(mockFn, 'default')();

  expect(mockFn).toHaveBeenCalledOnce();
  expect(result).toBe('Android only');
});

test('androidOnly returns default value on non-Android platform', async () => {
  process.env.CLIENT = 'true';
  Platform.is.nativeMobile = false;
  Platform.is.android = false;

  const mockFn = vi.fn(() => 'Android only');
  const result = await androidOnly(mockFn, 'default')();

  expect(mockFn).not.toHaveBeenCalled();
  expect(result).toBe('default');
});

test('clientOnly executes fn only when CLIENT is true', async () => {
  process.env.CLIENT = 'true';

  const mockFn = vi.fn(() => 'Client only');
  const result = await clientOnly(mockFn, 'default')();

  expect(mockFn).toHaveBeenCalledOnce();
  expect(result).toBe('Client only');
});

test('clientOnly returns default value when CLIENT is false', async () => {
  process.env.CLIENT = '';

  const mockFn = vi.fn(() => 'Client only');
  const result = await clientOnly(mockFn, 'default')();

  expect(mockFn).not.toHaveBeenCalled();
  expect(result).toBe('default');
});

test('serverOnly executes fn only when CLIENT is false', async () => {
  process.env.CLIENT = '';

  const mockFn = vi.fn(() => 'Server only');
  const result = await serverOnly(mockFn, 'default')();

  expect(mockFn).toHaveBeenCalledOnce();
  expect(result).toBe('Server only');
});

test('serverOnly returns default value when CLIENT is true', async () => {
  process.env.CLIENT = 'true';

  const mockFn = vi.fn(() => 'Server only');
  const result = await serverOnly(mockFn, 'default')();

  expect(mockFn).not.toHaveBeenCalled();
  expect(result).toBe('default');
});

test('mobileOnly executes fn only on mobile platform', async () => {
  process.env.CLIENT = 'true';
  Platform.is.mobile = true;

  const mockFn = vi.fn(() => 'Mobile only');
  const result = await mobileOnly(mockFn, 'default')();

  expect(mockFn).toHaveBeenCalledOnce();
  expect(result).toBe('Mobile only');
});

test('nativeMobileOnly executes fn only on mobile platform', async () => {
  process.env.CLIENT = 'true';
  Platform.is.nativeMobile = true;

  const mockFn = vi.fn(() => 'Mobile only');
  const result = await nativeMobileOnly(mockFn, 'default')();

  expect(mockFn).toHaveBeenCalledOnce();
  expect(result).toBe('Mobile only');
});

test('mobileOnly returns default value on non-mobile platform', async () => {
  process.env.CLIENT = 'true';
  Platform.is.mobile = false;

  const mockFn = vi.fn(() => 'Mobile only');
  const result = await mobileOnly(mockFn, 'default')();

  expect(mockFn).not.toHaveBeenCalled();
  expect(result).toBe('default');
});

test('desktopOnly executes fn only on desktop platform', async () => {
  process.env.CLIENT = 'true';
  Platform.is.mobile = false;

  const mockFn = vi.fn(() => 'Desktop only');
  const result = await desktopOnly(mockFn, 'default')();

  expect(mockFn).toHaveBeenCalledOnce();
  expect(result).toBe('Desktop only');
});

test('desktopOnly returns default value on mobile platform', async () => {
  process.env.CLIENT = 'true';
  Platform.is.mobile = true;

  const mockFn = vi.fn(() => 'Desktop only');
  const result = await desktopOnly(mockFn, 'default')();

  expect(mockFn).not.toHaveBeenCalled();
  expect(result).toBe('default');
});
