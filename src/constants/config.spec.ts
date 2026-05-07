import { test, expect } from 'vitest';
import { DEFAULT_CONFIG } from './config';

test('defaultCompletionLimit is at most 50 for reasonable first-open performance', () => {
  expect(DEFAULT_CONFIG.completion.defaultCompletionLimit).toBeLessThanOrEqual(50);
});
