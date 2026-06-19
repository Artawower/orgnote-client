import { expect, test } from 'vitest';
import {
  formatTags,
  getPropertyType,
  parseTags,
  validatePropertyKey,
  validatePropertyValue,
} from './property-model';

test('property model detects known value types', () => {
  expect(getPropertyType('tags')).toBe('tags');
  expect(getPropertyType('source')).toBe('link');
  expect(getPropertyType('created')).toBe('datetime');
  expect(getPropertyType('TQ_show_backlink')).toBe('boolean');
  expect(getPropertyType('custom')).toBe('text');
});

test('property model parses and formats org tags', () => {
  expect(parseTags(':youtube:ai:')).toEqual(['youtube', 'ai']);
  expect(parseTags('youtube ai')).toEqual(['youtube', 'ai']);
  expect(formatTags(['youtube', 'ai'])).toBe(':youtube:ai:');
});

test('property model validates keys and single-line values', () => {
  expect(validatePropertyKey('', [])).toBe('Property key is required');
  expect(validatePropertyKey('bad:key', [])).toBe('Use letters, digits, _ or -');
  expect(validatePropertyKey('type', [{ key: 'TYPE', value: 'note' }])).toBe(
    'Property key already exists',
  );
  expect(validatePropertyKey('type', [], 'type')).toBeUndefined();
  expect(validatePropertyValue('line\nbreak')).toBe('Property value must be single-line');
});
