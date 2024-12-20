import { test, expect, vi } from 'vitest';
import { resolveValue } from '../resolve-value.tool';

test('returns undefined if value is undefined', () => {
  const result = resolveValue();
  expect(result).toBeUndefined();
});

test('returns the value when it is a non-function', () => {
  const value = 'testValue';
  const result = resolveValue(value);
  expect(result).toBe(value);
});

test('calls the function and returns its value when value is a function', () => {
  const mockFunction = vi.fn(() => 'mockReturnValue');
  const result = resolveValue(mockFunction);
  expect(result).toBe('mockReturnValue');
  expect(mockFunction).toHaveBeenCalled();
});

test('handles numbers as value', () => {
  const value = 42;
  const result = resolveValue(value);
  expect(result).toBe(value);
});

test('handles objects as value', () => {
  const value = { key: 'value' };
  const result = resolveValue(value);
  expect(result).toEqual(value);
});

test('handles functions returning complex types', () => {
  const valueFunction = vi.fn(() => ({ key: 'value' }));
  const result = resolveValue(valueFunction);
  expect(result).toEqual({ key: 'value' });
  expect(valueFunction).toHaveBeenCalled();
});
