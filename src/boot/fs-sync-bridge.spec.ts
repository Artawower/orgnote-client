import { expect, test } from 'vitest';
import {
  FILE_MUTATION_OPERATION,
  type FileMutation,
  type FileMutationOperation,
} from 'src/models/file-mutation';
import { shouldTriggerSyncForMutation } from './fs-sync-bridge';

const mutation = (
  operation: FileMutationOperation,
  paths: readonly string[],
): FileMutation => ({ operation, paths });

test('file mutation triggers sync for user content writes', () => {
  expect(shouldTriggerSyncForMutation(
    mutation(FILE_MUTATION_OPERATION.WRITE, ['/notes/a.org']),
  )).toBe(true);
});

test('file mutation ignores extension runtime writes', () => {
  expect(shouldTriggerSyncForMutation(mutation(FILE_MUTATION_OPERATION.WRITE, [
    '/.orgnote/extensions/drawing-viewer/1.0.0/index.js',
  ]))).toBe(false);
});

test('file mutation ignores extension runtime directory changes', () => {
  expect(shouldTriggerSyncForMutation(mutation(FILE_MUTATION_OPERATION.CREATE_DIRECTORY, [
    '/.orgnote/extensions/drawing-viewer',
  ]))).toBe(false);
  expect(shouldTriggerSyncForMutation(mutation(FILE_MUTATION_OPERATION.REMOVE_DIRECTORY, [
    '/.orgnote/extensions/drawing-viewer',
  ]))).toBe(false);
});

test('file mutation ignores conflict artifact writes', () => {
  expect(shouldTriggerSyncForMutation(mutation(FILE_MUTATION_OPERATION.WRITE, [
    '/.orgnote/config.sync-conflict-100-device-remote.toml',
  ]))).toBe(false);
});

test('file mutation triggers sync when rename leaves extension runtime', () => {
  expect(shouldTriggerSyncForMutation(mutation(FILE_MUTATION_OPERATION.RENAME, [
    '/.orgnote/extensions/example/1.0.0/index.js',
    '/notes/example.js',
  ]))).toBe(true);
});

test('file mutation ignores rename contained in extension runtime', () => {
  expect(shouldTriggerSyncForMutation(mutation(FILE_MUTATION_OPERATION.RENAME, [
    '/.orgnote/extensions/example/index.js.tmp',
    '/.orgnote/extensions/example/index.js',
  ]))).toBe(false);
});

test('file mutation checks only changed copy destination', () => {
  expect(shouldTriggerSyncForMutation(mutation(FILE_MUTATION_OPERATION.COPY, [
    '/notes/copied.org',
  ]))).toBe(true);
});
