import { expect, test } from 'vitest';
import { isSyncAllowedForUser, shouldTriggerSyncForAction } from './fs-sync-bridge';
import type { OrgNoteConfig } from 'orgnote-api';
import { DEFAULT_CONFIG } from 'src/constants/config';

const API_SYNC_TYPE: OrgNoteConfig['synchronization']['type'] = 'api';

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

test('isSyncAllowedForUser returns true for active api user', () => {
  expect(isSyncAllowedForUser({ active: 'pro', syncType: API_SYNC_TYPE })).toBe(true);
});

test('isSyncAllowedForUser returns false for inactive user', () => {
  expect(isSyncAllowedForUser({ active: undefined, syncType: API_SYNC_TYPE })).toBe(false);
});

test('isSyncAllowedForUser returns false when synchronization is disabled', () => {
  expect(
    isSyncAllowedForUser({
      active: 'pro',
      syncType: DEFAULT_CONFIG.synchronization.type,
    }),
  ).toBe(false);
});
