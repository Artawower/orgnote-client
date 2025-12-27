import { test, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { orgInlineMarkupExtension, orgInlineMarkupManifest } from './index';
import { NodeType } from 'org-mode-ast';
import type { WidgetMeta } from 'orgnote-api';

type ClassGetter = string | ((node: unknown) => string);
type ClassBuilder = (node: unknown) => string;

interface LineClassWidget {
  class: ClassGetter;
}

interface InlineWidget {
  classBuilder?: ClassBuilder;
}

const mockAddWidgets = vi.fn();
const mockRemoveWidget = vi.fn();
const mockCreateWidgetBuilder = vi.fn(() => vi.fn());
const mockApplyScopedStyles = vi.fn();
const mockRemoveScopedStyles = vi.fn();

const mockApi = {
  core: {
    useEditor: () => ({
      addWidgets: mockAddWidgets,
      removeWidget: mockRemoveWidget,
      createWidgetBuilder: mockCreateWidgetBuilder,
    }),
  },
  utils: {
    applyScopedStyles: mockApplyScopedStyles,
    removeScopedStyles: mockRemoveScopedStyles,
  },
} as never;

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

afterEach(() => {
  const styleEl = document.getElementById('org-inline-markup');
  styleEl?.remove();
});

test('orgInlineMarkupManifest: has correct name', () => {
  expect(orgInlineMarkupManifest.name).toBe('Inline markup');
});

test('orgInlineMarkupManifest: has builtin source type', () => {
  expect(orgInlineMarkupManifest.source.type).toBe('builtin');
});

test('orgInlineMarkupManifest: has extension category', () => {
  expect(orgInlineMarkupManifest.category).toBe('extension');
});

test('orgInlineMarkupManifest: has version', () => {
  expect(orgInlineMarkupManifest.version).toBeDefined();
});

test('orgInlineMarkupExtension.onMounted: applies scoped styles', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  expect(mockApplyScopedStyles).toHaveBeenCalledTimes(1);
  expect(mockApplyScopedStyles).toHaveBeenCalledWith(
    'org-inline-markup',
    expect.any(String),
  );
});

test('orgInlineMarkupExtension.onMounted: applies styles with correct scope id', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  const scopeId = mockApplyScopedStyles.mock.calls[0]?.[0];
  expect(scopeId).toBe('org-inline-markup');
});

test('orgInlineMarkupExtension.onMounted: adds widgets to editor store', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  expect(mockAddWidgets).toHaveBeenCalledTimes(1);
});

test('orgInlineMarkupExtension.onMounted: adds inline widgets', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  const widgets = mockAddWidgets.mock.calls[0] as WidgetMeta[];
  const inlineWidgets = widgets.filter((w) => w.type === 'inline');

  expect(inlineWidgets.length).toBeGreaterThan(0);
});

test('orgInlineMarkupExtension.onMounted: adds lineClass widgets', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  const widgets = mockAddWidgets.mock.calls[0] as WidgetMeta[];
  const lineClassWidgets = widgets.filter((w) => w.type === 'line-class');

  expect(lineClassWidgets.length).toBeGreaterThan(0);
});

test('orgInlineMarkupExtension.onMounted: registers widget for Bold nodeType', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  const widgets = mockAddWidgets.mock.calls[0] as WidgetMeta[];
  const boldWidget = widgets.find((w) => w.nodeType === NodeType.Bold);

  expect(boldWidget).toBeUndefined();
});

test('orgInlineMarkupExtension.onMounted: registers widget for TodoKeyword nodeType', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  const widgets = mockAddWidgets.mock.calls[0] as WidgetMeta[];
  const todoWidget = widgets.find((w) => w.nodeType === NodeType.TodoKeyword);

  expect(todoWidget).toBeDefined();
  expect(todoWidget!.type).toBe('inline');
});

test('orgInlineMarkupExtension.onMounted: registers lineClass for Headline nodeType', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  const widgets = mockAddWidgets.mock.calls[0] as WidgetMeta[];
  const headlineWidget = widgets.find((w) => w.nodeType === NodeType.Headline);

  expect(headlineWidget).toBeDefined();
  expect(headlineWidget!.type).toBe('line-class');
});

test('orgInlineMarkupExtension.onMounted: registers lineClass for ListItem nodeType', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  const widgets = mockAddWidgets.mock.calls[0] as WidgetMeta[];
  const listItemWidget = widgets.find((w) => w.nodeType === NodeType.ListItem);

  expect(listItemWidget).toBeDefined();
  expect(listItemWidget!.type).toBe('line-class');
});

test('orgInlineMarkupExtension.onUnmounted: removes scoped styles', async () => {
  await orgInlineMarkupExtension.onUnmounted!(mockApi);

  expect(mockRemoveScopedStyles).toHaveBeenCalledTimes(1);
  expect(mockRemoveScopedStyles).toHaveBeenCalledWith('org-inline-markup');
});

test('orgInlineMarkupExtension.onUnmounted: removes all widgets that were added by id', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);
  const addedWidgets = mockAddWidgets.mock.calls[0] as WidgetMeta[];
  const addedIds = addedWidgets.map((w) => w.id);

  vi.clearAllMocks();
  await orgInlineMarkupExtension.onUnmounted!(mockApi);

  const removedIds = mockRemoveWidget.mock.calls.map((call) => call[0]);

  addedIds.forEach((id) => {
    expect(removedIds).toContain(id);
  });
});

test('orgInlineMarkupExtension.onUnmounted: removes same number of widgets as added', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);
  const addedCount = (mockAddWidgets.mock.calls[0] as WidgetMeta[]).length;

  vi.clearAllMocks();
  await orgInlineMarkupExtension.onUnmounted!(mockApi);

  expect(mockRemoveWidget).toHaveBeenCalledTimes(addedCount);
});

test('orgInlineMarkupExtension: ListItem lineClass returns correct class with checked state', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  const widgets = mockAddWidgets.mock.calls[0] as WidgetMeta[];
  const listItemWidget = widgets.find((w) => w.nodeType === NodeType.ListItem) as unknown as LineClassWidget;

  const mockCheckedNode = {
    title: {
      children: {
        get: (idx: number) => (idx === 1 ? { checked: true } : null),
      },
    },
    parent: { ordered: false },
  };

  const classGetter = listItemWidget.class as ClassBuilder;
  const className = classGetter(mockCheckedNode);
  expect(className).toContain('org-list-item-line');
  expect(className).toContain('org-list-item-checked');
  expect(className).toContain('org-list-item-bullet-line');
});

test('orgInlineMarkupExtension: ListItem lineClass returns ordered class when parent is ordered', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  const widgets = mockAddWidgets.mock.calls[0] as WidgetMeta[];
  const listItemWidget = widgets.find((w) => w.nodeType === NodeType.ListItem) as unknown as LineClassWidget;

  const mockOrderedNode = {
    title: { children: { get: () => null } },
    parent: { ordered: true },
  };

  const classGetter = listItemWidget.class as ClassBuilder;
  const className = classGetter(mockOrderedNode);
  expect(className).toContain('org-list-item-ordered-line');
  expect(className).not.toContain('org-list-item-bullet-line');
});

test('orgInlineMarkupExtension: Headline lineClass returns level-specific class', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  const widgets = mockAddWidgets.mock.calls[0] as WidgetMeta[];
  const headlineWidget = widgets.find((w) => w.nodeType === NodeType.Headline) as unknown as LineClassWidget;

  const mockHeadlineNode = { level: 3 };
  const classGetter = headlineWidget.class as ClassBuilder;
  const className = classGetter(mockHeadlineNode);

  expect(className).toContain('org-headline-line');
  expect(className).toContain('org-headline-3');
});

test('orgInlineMarkupExtension: TodoKeyword classBuilder returns keyword-specific class', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  const widgets = mockAddWidgets.mock.calls[0] as WidgetMeta[];
  const todoWidget = widgets.find((w) => w.nodeType === NodeType.TodoKeyword) as unknown as InlineWidget;

  const mockTodoNode = { value: 'TODO' };
  const classBuilder = todoWidget.classBuilder!;
  const className = classBuilder(mockTodoNode);

  expect(className).toBe('org-keyword-todo');
});

test('orgInlineMarkupExtension: TodoKeyword classBuilder handles different keywords', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);

  const widgets = mockAddWidgets.mock.calls[0] as WidgetMeta[];
  const todoWidget = widgets.find((w) => w.nodeType === NodeType.TodoKeyword) as unknown as InlineWidget;

  const classBuilder = todoWidget.classBuilder!;
  expect(classBuilder({ value: 'DONE' })).toBe('org-keyword-done');
  expect(classBuilder({ value: 'WAIT' })).toBe('org-keyword-wait');
});

test('orgInlineMarkupExtension: mount and unmount cycle is idempotent', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);
  await orgInlineMarkupExtension.onUnmounted!(mockApi);

  vi.clearAllMocks();

  await orgInlineMarkupExtension.onMounted!(mockApi);
  await orgInlineMarkupExtension.onUnmounted!(mockApi);

  expect(mockApplyScopedStyles).toHaveBeenCalledTimes(1);
  expect(mockRemoveScopedStyles).toHaveBeenCalledTimes(1);
});

test('orgInlineMarkupExtension: can be mounted multiple times after unmount', async () => {
  await orgInlineMarkupExtension.onMounted!(mockApi);
  await orgInlineMarkupExtension.onUnmounted!(mockApi);
  await orgInlineMarkupExtension.onMounted!(mockApi);

  expect(mockApplyScopedStyles).toHaveBeenCalledTimes(2);
  expect(mockAddWidgets).toHaveBeenCalledTimes(2);
});
