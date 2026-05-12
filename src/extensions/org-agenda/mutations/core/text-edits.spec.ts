import { test, expect } from 'vitest';
import { applyTextEdits } from './text-edits';
import type { TextEdit } from './text-edits';

test('applyTextEdits_emptyEdits_returnsOriginal', () => {
  expect(applyTextEdits('hello world', [])).toBe('hello world');
});

test('applyTextEdits_singleEdit_replacesRange', () => {
  expect(applyTextEdits('hello world', [{ start: 6, end: 11, replacement: 'earth' }])).toBe(
    'hello earth',
  );
});

test('applyTextEdits_multipleNonOverlapping_appliesAll', () => {
  const edits: TextEdit[] = [
    { start: 0, end: 5, replacement: 'bye' },
    { start: 6, end: 11, replacement: 'earth' },
  ];
  expect(applyTextEdits('hello world', edits)).toBe('bye earth');
});

test('applyTextEdits_editAtStart_insertsContent', () => {
  expect(applyTextEdits('world', [{ start: 0, end: 0, replacement: 'hello ' }])).toBe(
    'hello world',
  );
});

test('applyTextEdits_editAtEnd_appendsContent', () => {
  expect(applyTextEdits('hello', [{ start: 5, end: 5, replacement: ' world' }])).toBe(
    'hello world',
  );
});

test('applyTextEdits_overlappingEdits_throws', () => {
  const edits: TextEdit[] = [
    { start: 0, end: 10, replacement: 'a' },
    { start: 5, end: 15, replacement: 'b' },
  ];
  expect(() => applyTextEdits('hello world!!', edits)).toThrow('Overlapping text edits');
});

test('applyTextEdits_deleteEdit_removesRange', () => {
  expect(applyTextEdits('hello world', [{ start: 5, end: 11, replacement: '' }])).toBe('hello');
});
