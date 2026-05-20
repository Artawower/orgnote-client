import { expect, test } from 'vitest';
import { getTaskBody } from './get-task-body';

test('getTaskBody_returnsEmpty_whenNoSection', () => {
  expect(getTaskBody('* TODO Task', 0)).toBe('');
});

test('getTaskBody_returnsBody_afterScheduled', () => {
  const content = '* TODO Task\nSCHEDULED: <2026-05-17 Sun>\nDoes it work?';
  expect(getTaskBody(content, 0)).toBe('Does it work?');
});

test('getTaskBody_returnsBody_afterLogbook', () => {
  const content = [
    '* DONE Hola',
    'CLOSED: [2026-05-21 Thu 01:07] SCHEDULED: <2026-05-20 Wed>',
    ':LOGBOOK:',
    '- State "DONE" from "TODO" [2026-05-21 Thu 01:07]',
    ':END:',
    '',
    'Does it work?',
  ].join('\n');
  expect(getTaskBody(content, 0)).toBe('Does it work?');
});

test('getTaskBody_returnsEmpty_whenOnlyLogbook', () => {
  const content = [
    '* DONE Task',
    ':LOGBOOK:',
    '- State "DONE" from "TODO" [2026-05-21]',
    ':END:',
  ].join('\n');
  expect(getTaskBody(content, 0)).toBe('');
});

test('getTaskBody_returnsBody_withNoMetadata', () => {
  const content = '* TODO Task\nJust body text here.';
  expect(getTaskBody(content, 0)).toBe('Just body text here.');
});

test('getTaskBody_targetsCorrectHeadline_withOffset', () => {
  const content = [
    '* TODO First',
    'SCHEDULED: <2026-05-17 Sun>',
    'First body',
    '* TODO Second',
    'Second body',
  ].join('\n');
  const secondStart = content.indexOf('* TODO Second');
  expect(getTaskBody(content, secondStart)).toBe('Second body');
});

test('getTaskBody_returnsEmpty_whenNoBody_afterScheduled', () => {
  const content = '* TODO Task\nSCHEDULED: <2026-05-17 Sun>';
  expect(getTaskBody(content, 0)).toBe('');
});

test('getTaskBody_preservesBody_whenDrawerAfterText', () => {
  const content = ['* Task', 'First line of body', ':LOGBOOK:', '- entry', ':END:'].join('\n');
  const result = getTaskBody(content, 0);
  expect(result).toContain('First line of body');
});

test('getTaskBody_returnsBody_afterPropertiesDrawer', () => {
  const content = [
    '* Task',
    ':PROPERTIES:',
    ':ID: abc-123',
    ':CREATED: 2026-05-17',
    ':END:',
    'After body',
  ].join('\n');
  expect(getTaskBody(content, 0)).toBe('After body');
});

test('getTaskBody_returnsBody_afterPropertiesAndLogbook', () => {
  const content = [
    '* Task',
    ':PROPERTIES:',
    ':ID: abc',
    ':END:',
    ':LOGBOOK:',
    '- state change',
    ':END:',
    'Body text',
  ].join('\n');
  expect(getTaskBody(content, 0)).toBe('Body text');
});

test('getTaskBody_returnsEmpty_whenOnlyPropertiesDrawer', () => {
  const content = ['* Task', ':PROPERTIES:', ':ID: abc', ':END:'].join('\n');
  expect(getTaskBody(content, 0)).toBe('');
});
