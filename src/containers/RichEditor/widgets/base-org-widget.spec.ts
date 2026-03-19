import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import type { OrgNode } from 'org-mode-ast';
import type { CommonEmbeddedWidget } from 'orgnote-api';
import { BaseOrgWidget } from './base-org-widget';

class TestableOrgWidget extends BaseOrgWidget {
  public callUpdateValue(newVal: string): void {
    this.updateValue(newVal);
  }

  public override toDOM(): HTMLElement {
    return document.createElement('div');
  }
}

const createOrgNode = (start: number, end: number): OrgNode =>
  ({ start, end }) as unknown as OrgNode;

const createEmbeddedWidget = (overrides?: Partial<CommonEmbeddedWidget>): CommonEmbeddedWidget => ({
  id: 'test-widget',
  ...overrides,
});

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  container.remove();
});

const createEditorView = (doc: string, cursorPos = 0): EditorView =>
  new EditorView({
    state: EditorState.create({
      doc,
      selection: { anchor: cursorPos },
    }),
    parent: container,
  });

const createTestWidget = (
  view: EditorView,
  orgNode: OrgNode,
  embeddedWidget: CommonEmbeddedWidget,
): TestableOrgWidget => new TestableOrgWidget(view, () => null, orgNode, embeddedWidget);

test('BaseOrgWidget updateValue preserves cursor position after content replacement', () => {
  const doc = 'Hello World Test';
  const view = createEditorView(doc, 14);
  const orgNode = createOrgNode(0, 5);
  const widget = createTestWidget(view, orgNode, createEmbeddedWidget());

  widget.callUpdateValue('Hi');

  expect(view.state.doc.toString()).toBe('Hi World Test');
  expect(view.state.selection.main.head).toBe(11);

  view.destroy();
});

test('BaseOrgWidget updateValue uses custom viewUpdater when provided', () => {
  const doc = 'Hello World';
  const view = createEditorView(doc, 0);
  const orgNode = createOrgNode(0, 5);
  const customChanges = { from: 6, to: 11, insert: 'Earth' };
  const viewUpdater = vi.fn().mockReturnValue(customChanges);
  const widget = createTestWidget(view, orgNode, createEmbeddedWidget({ viewUpdater }));

  widget.callUpdateValue('ignored-by-updater');

  expect(viewUpdater).toHaveBeenCalledWith(orgNode, 'ignored-by-updater');
  expect(view.state.doc.toString()).toBe('Hello Earth');

  view.destroy();
});

test('BaseOrgWidget updateValue falls back to orgNode range without viewUpdater', () => {
  const doc = 'Hello World';
  const view = createEditorView(doc, 0);
  const orgNode = createOrgNode(0, 5);
  const widget = createTestWidget(view, orgNode, createEmbeddedWidget());

  widget.callUpdateValue('Hi');

  expect(view.state.doc.toString()).toBe('Hi World');

  view.destroy();
});

test('BaseOrgWidget updateValue restores editor focus after dispatch', () => {
  const doc = 'Hello World';
  const view = createEditorView(doc, 0);
  const orgNode = createOrgNode(0, 5);
  const widget = createTestWidget(view, orgNode, createEmbeddedWidget());
  const focusSpy = vi.spyOn(view, 'focus');

  widget.callUpdateValue('Hi');

  expect(focusSpy).toHaveBeenCalledOnce();

  view.destroy();
});
