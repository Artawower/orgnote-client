import { test, expect } from 'vitest';
import { sleep } from './sleep';

test('sleep delays for the specified time', async () => {
  const start = Date.now();
  const delay = 100; // 100ms
  await sleep(delay);
  const end = Date.now();

  expect(end - start).toBeGreaterThanOrEqual(delay);
  expect(end - start).toBeLessThan(delay + 50); // Tolerating small deviations
});

test('sleep resolves correctly', async () => {
  const result = await sleep(50);
  expect(result).toBeUndefined();
});

test('sleep handles zero delay', async () => {
  const start = Date.now();
  await sleep(0);
  const end = Date.now();

  expect(end - start).toBeGreaterThanOrEqual(0);
  expect(end - start).toBeLessThan(10); // Ensuring no unnecessary delay
});

test('sleep handles negative delay', async () => {
  const start = Date.now();
  await sleep(-100); // Negative delay should resolve immediately
  const end = Date.now();

  expect(end - start).toBeGreaterThanOrEqual(0);
  expect(end - start).toBeLessThan(10);
});
