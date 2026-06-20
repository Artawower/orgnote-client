import { afterEach, expect, test, vi } from 'vitest';
import { isOpenableExternalUrl, openExternalUrl, toOpenableExternalUrl } from './open-external-url';

afterEach(() => {
  vi.restoreAllMocks();
});

test('open-external-url accepts http and https urls', () => {
  expect(isOpenableExternalUrl('https://example.com/path')).toBe(true);
  expect(isOpenableExternalUrl('http://example.com/path')).toBe(true);
});

test('open-external-url rejects non-external and unsafe urls', () => {
  expect(isOpenableExternalUrl('/settings')).toBe(false);
  expect(isOpenableExternalUrl('javascript:alert(1)')).toBe(false);
  expect(isOpenableExternalUrl('file:///tmp/note.org')).toBe(false);
  expect(isOpenableExternalUrl('not a url')).toBe(false);
});

test('open-external-url trims url before parsing', () => {
  expect(toOpenableExternalUrl('  https://example.com/path  ')?.toString()).toBe(
    'https://example.com/path',
  );
});

test('open-external-url opens safe urls with isolation flags', () => {
  const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

  openExternalUrl('https://example.com/path');

  expect(openSpy).toHaveBeenCalledWith(
    'https://example.com/path',
    '_blank',
    'noopener,noreferrer',
  );
});

test('open-external-url does not open unsafe urls', () => {
  const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

  openExternalUrl('javascript:alert(1)');

  expect(openSpy).not.toHaveBeenCalled();
});
