import { test, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useRightPanelStore } from './right-panel';
import { defineComponent } from 'vue';
import { DefaultCommands } from 'orgnote-api';

const createMockComponent = (name: string) =>
  defineComponent({ name, template: '<div />' });

beforeEach(() => {
  setActivePinia(createPinia());
});

test('useRightPanelStore should initialize with default width 300', () => {
  const store = useRightPanelStore();
  expect(store.width).toBe(300);
});

test('useRightPanelStore should initialize with closed state', () => {
  const store = useRightPanelStore();
  expect(store.opened).toBe(false);
});

test('useRightPanelStore should have TOGGLE_AST_DEBUGGER command by default', () => {
  const store = useRightPanelStore();
  expect(store.commands).toContain(DefaultCommands.TOGGLE_AST_DEBUGGER);
});

test('useRightPanelStore.setWidth should update width within bounds', () => {
  const store = useRightPanelStore();
  store.setWidth(400);
  expect(store.width).toBe(400);
});

test('useRightPanelStore.setWidth should clamp to minimum 200', () => {
  const store = useRightPanelStore();
  store.setWidth(100);
  expect(store.width).toBe(200);
});

test('useRightPanelStore.setWidth should clamp to maximum 600', () => {
  const store = useRightPanelStore();
  store.setWidth(800);
  expect(store.width).toBe(600);
});

test('useRightPanelStore.setWidth should handle negative values', () => {
  const store = useRightPanelStore();
  store.setWidth(-100);
  expect(store.width).toBe(200);
});

test('useRightPanelStore.setWidth should handle zero', () => {
  const store = useRightPanelStore();
  store.setWidth(0);
  expect(store.width).toBe(200);
});

test('useRightPanelStore.setWidth should handle exact minimum boundary', () => {
  const store = useRightPanelStore();
  store.setWidth(200);
  expect(store.width).toBe(200);
});

test('useRightPanelStore.setWidth should handle exact maximum boundary', () => {
  const store = useRightPanelStore();
  store.setWidth(600);
  expect(store.width).toBe(600);
});

test('useRightPanelStore.setWidth should handle float values', () => {
  const store = useRightPanelStore();
  store.setWidth(350.5);
  expect(store.width).toBe(350.5);
});

test('useRightPanelStore.setWidth should ignore NaN and keep previous value', () => {
  const store = useRightPanelStore();
  store.setWidth(400);
  store.setWidth(NaN);
  expect(store.width).toBe(400);
});

test('useRightPanelStore.setWidth should handle Infinity by clamping to maximum', () => {
  const store = useRightPanelStore();
  store.setWidth(Infinity);
  expect(store.width).toBe(600);
});

test('useRightPanelStore.open should set opened to true', () => {
  const store = useRightPanelStore();
  store.open();
  expect(store.opened).toBe(true);
});

test('useRightPanelStore.close should set opened to false', () => {
  const store = useRightPanelStore();
  store.open();
  store.close();
  expect(store.opened).toBe(false);
});

test('useRightPanelStore.toggle should switch opened state', () => {
  const store = useRightPanelStore();
  store.toggle();
  expect(store.opened).toBe(true);
  store.toggle();
  expect(store.opened).toBe(false);
});

test('useRightPanelStore.openComponent should set component and open panel', () => {
  const store = useRightPanelStore();
  const mockComponent = createMockComponent('TestPanel');

  store.openComponent(mockComponent);

  expect(store.component).toBe(mockComponent);
  expect(store.opened).toBe(true);
});

test('useRightPanelStore.addCommand should add new command', () => {
  const store = useRightPanelStore();
  store.addCommand('custom-command');
  expect(store.commands).toContain('custom-command');
});

test('useRightPanelStore.removeCommand should remove existing command', () => {
  const store = useRightPanelStore();
  store.addCommand('temp-command');
  store.removeCommand('temp-command');
  expect(store.commands).not.toContain('temp-command');
});

test('useRightPanelStore should persist state across multiple accesses', () => {
  const store1 = useRightPanelStore();
  store1.setWidth(450);
  store1.open();

  const store2 = useRightPanelStore();
  expect(store2.width).toBe(450);
  expect(store2.opened).toBe(true);
});

test('useRightPanelStore.setWidth should handle rapid consecutive calls', () => {
  const store = useRightPanelStore();

  store.setWidth(250);
  store.setWidth(350);
  store.setWidth(450);
  store.setWidth(550);

  expect(store.width).toBe(550);
});

test('useRightPanelStore should handle width at boundary after component change', () => {
  const store = useRightPanelStore();
  const component = createMockComponent('Panel');

  store.setWidth(600);
  store.openComponent(component);

  expect(store.width).toBe(600);
  expect(store.opened).toBe(true);
});
