import { test, expect, vi } from 'vitest';
import { isInternalLink, extractInternalId, resolveInternalNoteUri } from './org-link';

test('org-link isInternalLink returns true for id: prefixed links', () => {
  expect(isInternalLink('id:abc-123')).toBe(true);
});

test('org-link isInternalLink returns true for id: with uuid', () => {
  expect(isInternalLink('id:550e8400-e29b-41d4-a716-446655440000')).toBe(true);
});

test('org-link isInternalLink returns false for http links', () => {
  expect(isInternalLink('https://example.com')).toBe(false);
});

test('org-link isInternalLink returns false for file links', () => {
  expect(isInternalLink('file:///path/to/file.org')).toBe(false);
});

test('org-link isInternalLink returns false for empty string', () => {
  expect(isInternalLink('')).toBe(false);
});

test('org-link isInternalLink returns false for plain text', () => {
  expect(isInternalLink('some random text')).toBe(false);
});

test('org-link extractInternalId extracts id from id: link', () => {
  expect(extractInternalId('id:abc-123')).toBe('abc-123');
});

test('org-link extractInternalId extracts uuid from id: link', () => {
  expect(extractInternalId('id:550e8400-e29b-41d4-a716-446655440000')).toBe(
    '550e8400-e29b-41d4-a716-446655440000',
  );
});

test('org-link extractInternalId returns empty string for non-id link', () => {
  expect(extractInternalId('https://example.com')).toBe('');
});

test('org-link extractInternalId returns empty string for empty input', () => {
  expect(extractInternalId('')).toBe('');
});

test('org-link resolveInternalNoteUri resolves note id to buffer URI via file path', async () => {
  const getFileMeta = vi.fn().mockResolvedValue({ filePath: ['notes', 'my-note.org'] });
  const result = await resolveInternalNoteUri('abc-123', getFileMeta);
  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toBe('file://notes/my-note.org');
});

test('org-link resolveInternalNoteUri returns ok undefined when note not found', async () => {
  const getFileMeta = vi.fn().mockResolvedValue(undefined);
  const result = await resolveInternalNoteUri('missing-id', getFileMeta);
  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toBeUndefined();
});

test('org-link resolveInternalNoteUri passes note id to getter', async () => {
  const getFileMeta = vi.fn().mockResolvedValue({ filePath: ['test.org'] });
  await resolveInternalNoteUri('my-id', getFileMeta);
  expect(getFileMeta).toHaveBeenCalledWith('my-id');
});

test('org-link resolveInternalNoteUri returns err when getter rejects', async () => {
  const getFileMeta = vi.fn().mockRejectedValue(new Error('DB connection lost'));
  const result = await resolveInternalNoteUri('abc-123', getFileMeta);
  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr().message).toContain('Failed to resolve note: abc-123');
});

test('org-link resolveInternalNoteUri returns ok undefined for empty note id', async () => {
  const getFileMeta = vi.fn().mockResolvedValue(undefined);
  const result = await resolveInternalNoteUri('', getFileMeta);
  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toBeUndefined();
});
