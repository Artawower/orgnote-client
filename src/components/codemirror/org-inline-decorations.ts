import { Decoration, EditorView, WidgetType, ViewPlugin } from '@codemirror/view';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import type { Range } from '@codemirror/state';
import { NodeType, walkTree } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';

const MARKUP_PARENT_TYPES = [
  NodeType.Bold,
  NodeType.Italic,
  NodeType.Verbatim,
  NodeType.InlineCode,
  NodeType.Crossed,
  NodeType.Underline,
] as const;

const invisibleReplace = Decoration.replace({});

class BulletWidget extends WidgetType {
  constructor(private readonly char: string) {
    super();
  }

  override toDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'org-list-bullet';
    span.textContent = this.char;
    return span;
  }

  override eq(other: WidgetType): boolean {
    return (other as BulletWidget).char === this.char;
  }

  override ignoreEvent(): boolean {
    return true;
  }
}

const isMarkupOperator = (node: OrgNode): boolean =>
  node.is(NodeType.Operator) && MARKUP_PARENT_TYPES.some((t) => node.parent?.is(t));

const isListItemOperator = (node: OrgNode): boolean =>
  node.is(NodeType.Operator) &&
  !!(
    node.parent?.parent?.is(NodeType.ListItem) &&
    !node.parent.parent.parent?.ordered &&
    node.parent.isNot(NodeType.Section)
  );

const isOnActiveLine = (view: EditorView, node: OrgNode, caret: number): boolean => {
  const clampedStart = Math.min(node.start, view.state.doc.length - 1);
  const activeLine = view.state.doc.lineAt(caret);
  const nodeLine = view.state.doc.lineAt(Math.max(0, clampedStart));
  return activeLine.number === nodeLine.number;
};

const isCaretInParentRange = (caret: number, node: OrgNode): boolean => {
  const parent = node.parent;
  return !!(parent && caret >= parent.start && caret <= parent.end);
};

const buildMarkupHideDecorations = (
  view: EditorView,
  getOrgNode: () => OrgNode | null,
): DecorationSet => {
  const orgNode = getOrgNode();
  if (!orgNode) return Decoration.none;

  const ranges: Range<Decoration>[] = [];
  const caret = view.state.selection.main.head;

  walkTree(orgNode, (node: OrgNode): boolean => {
    if (!isMarkupOperator(node)) return false;
    if (view.hasFocus && isOnActiveLine(view, node, caret)) return false;
    if (view.hasFocus && isCaretInParentRange(caret, node)) return false;

    ranges.push(invisibleReplace.range(node.start, node.end));
    return false;
  });

  ranges.sort((a, b) => a.from - b.from);
  return Decoration.set(ranges);
};

const buildListBulletDecorations = (
  _view: EditorView,
  getOrgNode: () => OrgNode | null,
): DecorationSet => {
  const orgNode = getOrgNode();
  if (!orgNode) return Decoration.none;

  const ranges: Range<Decoration>[] = [];

  walkTree(orgNode, (node: OrgNode): boolean => {
    if (!isListItemOperator(node)) return false;

    const operator = node.value?.trim();
    const char = operator === '-' ? '•' : '◦';
    ranges.push(Decoration.replace({ widget: new BulletWidget(char) }).range(node.start, node.end));
    return false;
  });

  ranges.sort((a, b) => a.from - b.from);
  return Decoration.set(ranges);
};

export const createOrgInlineDecorations = (getOrgNode: () => OrgNode | null) => {
  const markupPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none;

      constructor(view: EditorView) {
        this.decorations = buildMarkupHideDecorations(view, getOrgNode);
      }

      update(update: ViewUpdate): void {
        if (
          update.docChanged ||
          update.viewportChanged ||
          update.focusChanged ||
          update.selectionSet
        ) {
          this.decorations = buildMarkupHideDecorations(update.view, getOrgNode);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => view.plugin(plugin)?.decorations ?? Decoration.none),
    },
  );

  const listPlugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none;

      constructor(view: EditorView) {
        this.decorations = buildListBulletDecorations(view, getOrgNode);
      }

      update(update: ViewUpdate): void {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = buildListBulletDecorations(update.view, getOrgNode);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => view.plugin(plugin)?.decorations ?? Decoration.none),
    },
  );

  return [markupPlugin, listPlugin];
};
