import { expect, test } from 'vitest';
import { shouldTriggerSyncForAction } from './fs-sync-bridge';

test('shouldTriggerSyncForAction returns true for writeFile action', () => {
  expect(shouldTriggerSyncForAction('writeFile')).toBe(true);
});

test('shouldTriggerSyncForAction ignores extension runtime writes', () => {
  expect(
    shouldTriggerSyncForAction('writeFile', [
      '/.orgnote/extensions/drawing-viewer/1.0.0/index.js',
    ]),
  ).toBe(false);
});

test('shouldTriggerSyncForAction ignores extension runtime directory changes', () => {
  expect(shouldTriggerSyncForAction('mkdir', ['.orgnote/extensions/drawing-viewer'])).toBe(false);
  expect(shouldTriggerSyncForAction('rmdir', ['/.orgnote/extensions/drawing-viewer'])).toBe(false);
});

test('shouldTriggerSyncForAction ignores conflict artifact writes', () => {
  expect(
    shouldTriggerSyncForAction('writeFile', [
      '/.orgnote/config.sync-conflict-100-device-remote.toml',
    ])
  ).toBe(false);
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

test('shouldTriggerSyncForAction returns true for mkdir action', () => {
  expect(shouldTriggerSyncForAction('mkdir')).toBe(true);
});

test('shouldTriggerSyncForAction returns true for rmdir action', () => {
  expect(shouldTriggerSyncForAction('rmdir')).toBe(true);
});

test('shouldTriggerSyncForAction returns true for copyFile action', () => {
  expect(shouldTriggerSyncForAction('copyFile')).toBe(true);
});

test('shouldTriggerSyncForAction returns false for unknown action', () => {
  expect(shouldTriggerSyncForAction('unknownOp')).toBe(false);
});
