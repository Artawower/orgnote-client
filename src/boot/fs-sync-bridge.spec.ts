import { expect, test } from 'vitest';
import { shouldTriggerSyncForAction } from './fs-sync-bridge';

test('shouldTriggerSyncForAction returns true for writeFile action', () => {
  expect(shouldTriggerSyncForAction('writeFile')).toBe(true);
});

test('shouldTriggerSyncForAction returns true for rename action', () => {
  expect(shouldTriggerSyncForAction('rename')).toBe(true);
});

test('shouldTriggerSyncForAction returns true for deleteFile action', () => {
  expect(shouldTriggerSyncForAction('deleteFile')).toBe(true);
});

test('shouldTriggerSyncForAction returns false for readFile action', () => {
  expect(shouldTriggerSyncForAction('readFile')).toBe(false);
});
