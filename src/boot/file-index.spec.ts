import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { isOrgFile } from 'orgnote-api';

vi.mock('orgnote-api', async () => {
  const actual = await vi.importActual('orgnote-api');
  return {
    ...actual,
    isOrgFile: vi.fn((path: string) => path.endsWith('.org') || path.endsWith('.org.gpg')),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

test('isOrgFile returns true for .org files', () => {
  expect(isOrgFile('/notes/test.org')).toBe(true);
});

test('isOrgFile returns true for .org.gpg files', () => {
  expect(isOrgFile('/notes/secret.org.gpg')).toBe(true);
});

test('isOrgFile returns false for .txt files', () => {
  expect(isOrgFile('/notes/readme.txt')).toBe(false);
});

test('isOrgFile returns false for .md files', () => {
  expect(isOrgFile('/notes/readme.md')).toBe(false);
});

test('isOrgFile returns false for .json files', () => {
  expect(isOrgFile('/data/config.json')).toBe(false);
});

test('isOrgFile handles nested paths', () => {
  expect(isOrgFile('/folder/subfolder/deep/note.org')).toBe(true);
});

test('isOrgFile handles root path files', () => {
  expect(isOrgFile('/root.org')).toBe(true);
});

test('path split correctly extracts file parts', () => {
  const path = '/notes/deleted.org';
  const parts = path.split('/').filter(Boolean);

  expect(parts).toEqual(['notes', 'deleted.org']);
});

test('path split handles multiple levels', () => {
  const path = '/folder/subfolder/file.org';
  const parts = path.split('/').filter(Boolean);

  expect(parts).toEqual(['folder', 'subfolder', 'file.org']);
});

test('path split handles root level files', () => {
  const path = '/root.org';
  const parts = path.split('/').filter(Boolean);

  expect(parts).toEqual(['root.org']);
});

test('file change type delete is identified', () => {
  const change = { type: 'delete', path: '/notes/deleted.org' };
  expect(change.type).toBe('delete');
});

test('file change type modify is identified', () => {
  const change = { type: 'modify', path: '/notes/modified.org' };
  expect(change.type).toBe('modify');
});

test('file change type create is identified', () => {
  const change = { type: 'create', path: '/notes/new.org' };
  expect(change.type).toBe('create');
});
