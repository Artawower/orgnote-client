import { test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSettingsStore } from './settings';

beforeEach(() => {
  setActivePinia(createPinia());
});

test('initial state', () => {
  const store = useSettingsStore();

  expect(store.settings).toEqual({});
  expect(store.tokens).toEqual([]);
});

test('able to mutate tokens', () => {
  const store = useSettingsStore();

  store.tokens.push({ id: '1', token: 'abc123' });
  store.tokens.push({ id: '2', token: 'xyz987' });

  expect(store.tokens).toHaveLength(2);
  expect(store.tokens[0]).toEqual({ id: 1, token: 'abc123' });
});

test('able to mutate settings', () => {
  const store = useSettingsStore();

  store.settings.newProp = 'hello';

  expect(store.settings.newProp).toBe('hello');
});
