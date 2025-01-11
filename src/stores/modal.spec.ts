import { test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useModalStore } from './modal';
import { defineComponent } from 'vue';

beforeEach(() => {
  setActivePinia(createPinia());
});

test('initial state', () => {
  const store = useModalStore();

  expect(store.opened).toBe(false);
  expect(store.component).toBeUndefined();
  expect(store.config).toBeUndefined();
  expect(store.title).toBeUndefined();
});

test('open method adds a new component to the stack', () => {
  const store = useModalStore();
  const mockComponent = defineComponent({});

  store.open(mockComponent, { title: 'Test Modal', closable: true });

  expect(store.opened).toBe(true);
  expect(store.component).toBe(mockComponent);
  expect(store.config).toEqual({ title: 'Test Modal', closable: true });
  expect(store.title).toBe('Test Modal');
});

test('open method prevents duplicate components', () => {
  const store = useModalStore();
  const mockComponent = defineComponent({});

  store.open(mockComponent, { title: 'First Modal', closable: true });
  store.open(mockComponent, { title: 'Second Modal', closable: false });

  expect(store.opened).toBe(true);
  expect(store.component).toBe(mockComponent);
  expect(store.config).toEqual({ title: 'First Modal', closable: true });
  expect(store.title).toBe('First Modal');
});

test('close method removes the last component from the stack', () => {
  const store = useModalStore();
  const mockComponent1 = defineComponent({});
  const mockComponent2 = defineComponent({});

  store.open(mockComponent1);
  store.open(mockComponent2);
  store.close();

  expect(store.opened).toBe(true);
  expect(store.component).toBe(mockComponent1);
  store.close();
  expect(store.opened).toBe(false);
});

test('close method does nothing if stack is empty', () => {
  const store = useModalStore();

  store.close();

  expect(store.opened).toBe(false);
  expect(store.component).toBeUndefined();
});

test('closeAll method clears the stack and closes the modal', () => {
  const store = useModalStore();
  const mockComponent1 = defineComponent({});
  const mockComponent2 = defineComponent({});

  store.open(mockComponent1);
  store.open(mockComponent2);
  store.closeAll();

  expect(store.opened).toBe(false);
  expect(store.component).toBeUndefined();
  expect(store.config).toBeUndefined();
});
