import { debounce } from './debounce';
import { test, vi, expect } from 'vitest';

test('debounce calls the function after the specified delay', async () => {
  const mockFunction = vi.fn();
  const debouncedFunction = debounce(mockFunction, 100);

  debouncedFunction();

  expect(mockFunction).not.toHaveBeenCalled();

  await new Promise((resolve) => setTimeout(resolve, 150));

  expect(mockFunction).toHaveBeenCalledTimes(1);
});

test('debounce resets the timer if called repeatedly', async () => {
  const mockFunction = vi.fn();
  const debouncedFunction = debounce(mockFunction, 100);

  debouncedFunction();
  setTimeout(() => debouncedFunction(), 50); // Reset debounce timer
  setTimeout(() => debouncedFunction(), 90); // Reset debounce timer again

  await new Promise((resolve) => setTimeout(resolve, 200));

  expect(mockFunction).toHaveBeenCalledTimes(1);
});

test('debounce works with arguments', async () => {
  const mockFunction = vi.fn();
  const debouncedFunction = debounce(mockFunction, 100);

  debouncedFunction('test', 42);

  await new Promise((resolve) => setTimeout(resolve, 150));

  expect(mockFunction).toHaveBeenCalledTimes(1);
  expect(mockFunction).toHaveBeenCalledWith('test', 42);
});

test('debounce does not call the function if canceled before delay', async () => {
  const mockFunction = vi.fn();
  const debouncedFunction = debounce(mockFunction, 100);

  debouncedFunction();
  debouncedFunction(); // Call again to reset the timer

  await new Promise((resolve) => setTimeout(resolve, 50));

  expect(mockFunction).not.toHaveBeenCalled();
});
