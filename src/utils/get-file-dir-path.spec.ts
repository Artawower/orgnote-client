import { getFileDirPath } from './get-file-dir-path';
import { expect, test } from 'vitest';

test('Should return file path from array of strings', () => {
  expect(getFileDirPath(['dir', 'nested-dir', 'file.org'])).toBe('dir/nested-dir');
});

test('Should return file path from string', () => {
  expect(getFileDirPath('dir/nested-dir/file.org')).toBe('dir/nested-dir');
});

test('Should return empty string when file is in root', () => {
  expect(getFileDirPath('file.org')).toBe('');
  expect(getFileDirPath(['file.org'])).toBe('');
});

test('Should return empty string when file path is empty', () => {
  expect(getFileDirPath('')).toBe('');
  expect(getFileDirPath([])).toBe('');
});

test('Should return an empty string when a slash is passed as an argument', () => {
  expect(getFileDirPath('/')).toBe('');
  expect(getFileDirPath(['/'])).toBe('');
});
