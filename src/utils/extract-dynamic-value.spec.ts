import { test, expect } from 'vitest';
import { extractDynamicValue } from './extract-dynamic-value';

test('returns the value when provided a primitive', () => {
  const input = 42;
  const output = extractDynamicValue(input);
  expect(output).toBe(42);
});

test('returns the value when provided a string', () => {
  const input = 'test';
  const output = extractDynamicValue(input);
  expect(output).toBe('test');
});

test('returns the result of a function when provided', () => {
  const input = () => 'dynamic';
  const output = extractDynamicValue(input);
  expect(output).toBe('dynamic');
});

test('returns undefined when value is undefined', () => {
  const output = extractDynamicValue(undefined);
  expect(output).toBeUndefined();
});

test('returns undefined when value is not provided', () => {
  const output = extractDynamicValue();
  expect(output).toBeUndefined();
});

test('handles function returning falsy value', () => {
  const input = () => 0;
  const output = extractDynamicValue(input);
  expect(output).toBe(0);
});

test('handles falsy primitive value', () => {
  const input = false;
  const output = extractDynamicValue(input);
  expect(output).toBe(false);
});
