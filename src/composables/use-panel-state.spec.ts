import { test, expect } from 'vitest';
import { usePanelState } from './use-panel-state';
import { defineComponent } from 'vue';

const createMockComponent = (name: string) =>
  defineComponent({ name, template: '<div />' });

test('usePanelState should initialize with closed state', () => {
  const panel = usePanelState();
  expect(panel.opened.value).toBe(false);
});

test('usePanelState should initialize with empty commands by default', () => {
  const panel = usePanelState();
  expect(panel.commands.value).toEqual([]);
});

test('usePanelState should initialize with provided default commands', () => {
  const panel = usePanelState(['cmd1', 'cmd2']);
  expect(panel.commands.value).toEqual(['cmd1', 'cmd2']);
});

test('usePanelState should initialize with undefined component', () => {
  const panel = usePanelState();
  expect(panel.component.value).toBeUndefined();
});

test('usePanelState.open should set opened to true', () => {
  const panel = usePanelState();
  panel.open();
  expect(panel.opened.value).toBe(true);
});

test('usePanelState.close should set opened to false', () => {
  const panel = usePanelState();
  panel.open();
  panel.close();
  expect(panel.opened.value).toBe(false);
});

test('usePanelState.toggle should switch opened state from false to true', () => {
  const panel = usePanelState();
  panel.toggle();
  expect(panel.opened.value).toBe(true);
});

test('usePanelState.toggle should switch opened state from true to false', () => {
  const panel = usePanelState();
  panel.open();
  panel.toggle();
  expect(panel.opened.value).toBe(false);
});

test('usePanelState.toggle should work correctly when called multiple times', () => {
  const panel = usePanelState();
  panel.toggle();
  panel.toggle();
  panel.toggle();
  expect(panel.opened.value).toBe(true);
});

test('usePanelState.openComponent should set component and open panel', () => {
  const panel = usePanelState();
  const mockComponent = createMockComponent('TestComponent');

  panel.openComponent(mockComponent);

  expect(panel.component.value).toBe(mockComponent);
  expect(panel.opened.value).toBe(true);
});

test('usePanelState.openComponent should set componentConfig when provided', () => {
  const panel = usePanelState();
  const mockComponent = createMockComponent('TestComponent');
  const config = { componentProps: { foo: 'bar' } };

  panel.openComponent(mockComponent, config);

  expect(panel.componentConfig.value).toEqual(config);
});

test('usePanelState.openComponent should reopen panel with same component after close', () => {
  const panel = usePanelState();
  const mockComponent = createMockComponent('TestComponent');

  panel.openComponent(mockComponent);
  panel.close();
  panel.openComponent(mockComponent);

  expect(panel.opened.value).toBe(true);
  expect(panel.component.value).toBe(mockComponent);
});

test('usePanelState.openComponent should open different component', () => {
  const panel = usePanelState();
  const component1 = createMockComponent('Component1');
  const component2 = createMockComponent('Component2');

  panel.openComponent(component1);
  panel.openComponent(component2);

  expect(panel.component.value).toBe(component2);
  expect(panel.opened.value).toBe(true);
});

test('usePanelState.addCommand should add new command', () => {
  const panel = usePanelState();
  panel.addCommand('new-command');
  expect(panel.commands.value).toContain('new-command');
});

test('usePanelState.addCommand should not add duplicate command', () => {
  const panel = usePanelState(['existing']);
  panel.addCommand('existing');
  expect(panel.commands.value).toEqual(['existing']);
});

test('usePanelState.addCommand should preserve order of commands', () => {
  const panel = usePanelState(['first']);
  panel.addCommand('second');
  panel.addCommand('third');
  expect(panel.commands.value).toEqual(['first', 'second', 'third']);
});

test('usePanelState.removeCommand should remove existing command', () => {
  const panel = usePanelState(['cmd1', 'cmd2', 'cmd3']);
  panel.removeCommand('cmd2');
  expect(panel.commands.value).toEqual(['cmd1', 'cmd3']);
});

test('usePanelState.removeCommand should do nothing for non-existent command', () => {
  const panel = usePanelState(['cmd1', 'cmd2']);
  panel.removeCommand('non-existent');
  expect(panel.commands.value).toEqual(['cmd1', 'cmd2']);
});

test('usePanelState.removeCommand should handle empty commands array', () => {
  const panel = usePanelState();
  panel.removeCommand('any');
  expect(panel.commands.value).toEqual([]);
});

test('usePanelState should allow multiple open/close cycles', () => {
  const panel = usePanelState();

  for (let i = 0; i < 10; i++) {
    panel.open();
    expect(panel.opened.value).toBe(true);
    panel.close();
    expect(panel.opened.value).toBe(false);
  }
});

test('usePanelState.openComponent should handle undefined config', () => {
  const panel = usePanelState();
  const mockComponent = createMockComponent('TestComponent');

  panel.openComponent(mockComponent, undefined);

  expect(panel.componentConfig.value).toBeUndefined();
  expect(panel.opened.value).toBe(true);
});
