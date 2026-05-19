import { Decoration, EditorView, WidgetType, ViewPlugin } from '@codemirror/view';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import type { Range } from '@codemirror/state';
import { NodeType, walkTree } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';
import { isPresent } from 'orgnote-api';
import { findOrgTagRanges } from '../tags/find-org-tag-ranges';

const MARKUP_PARENT_TYPES = [
  NodeType.Bold,
  NodeType.Italic,
  NodeType.Verbatim,
  NodeType.InlineCode,
  NodeType.Crossed,
  NodeType.Underline,
] as const;

const invisibleReplace = Decoration.replace({});
const tagMark = Decoration.mark({ class: 'org-file-tag' });
const linkMark = Decoration.mark({ class: 'org-link' });

class BulletWidget extends WidgetType {
  constructor(
    private readonly char: string,
    private readonly className: string,
  ) {
    super();
  }

  override toDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = this.className;
    span.textContent = this.char;
    return span;
  }

  override eq(other: WidgetType): boolean {
    const o = other as BulletWidget;
    return o.char === this.char && o.className === this.className;
  }

  override ignoreEvent(): boolean {
    return true;
  }
}

const isMarkupOperator = (node: OrgNode): boolean =>
  node.is(NodeType.Operator) && MARKUP_PARENT_TYPES.some((t) => node.parent?.is(t));

const isInHeadlineTitle = (node: OrgNode): boolean =>
  (node.parent?.is(NodeType.Title) ?? false) &&
  (node.parent?.parent?.is(NodeType.Headline) ?? false);

const isHeadlineOperator = (node: OrgNode): boolean =>
  node.is(NodeType.Operator) && isInHeadlineTitle(node);

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
  singleLine: boolean,
): DecorationSet => {
  const orgNode = getOrgNode();
  if (!orgNode) return Decoration.none;

  const ranges: Range<Decoration>[] = [];
  const caret = view.state.selection.main.head;

  walkTree(orgNode, (node: OrgNode): boolean => {
    if (!isMarkupOperator(node)) return false;
    if (!singleLine && view.hasFocus && isOnActiveLine(view, node, caret)) return false;
    if (view.hasFocus && isCaretInParentRange(caret, node)) return false;

    ranges.push(invisibleReplace.range(node.start, node.end));
    return false;
  });

  ranges.sort((a, b) => a.from - b.from);
  return Decoration.set(ranges);
};

const buildHeadlineOperatorDecorations = (
  view: EditorView,
  getOrgNode: () => OrgNode | null,
): DecorationSet => {
  const orgNode = getOrgNode();
  if (!orgNode) return Decoration.none;

  const ranges: Range<Decoration>[] = [];
  const caret = view.state.selection.main.head;

  walkTree(orgNode, (node: OrgNode): boolean => {
    if (!isHeadlineOperator(node)) return false;
    if (view.hasFocus && isOnActiveLine(view, node, caret)) return false;

    ranges.push(invisibleReplace.range(node.start, node.end));
    return false;
  });

  ranges.sort((a, b) => a.from - b.from);
  return Decoration.set(ranges);
};

const buildListBulletDecorations = (
  getOrgNode: () => OrgNode | null,
  bulletClass: string,
): DecorationSet => {
  const orgNode = getOrgNode();
  if (!orgNode) return Decoration.none;

  const ranges: Range<Decoration>[] = [];

  walkTree(orgNode, (node: OrgNode): boolean => {
    if (!isListItemOperator(node)) return false;

    const operator = node.value?.trim();
    const char = operator === '-' ? '•' : '◦';
    ranges.push(
      Decoration.replace({ widget: new BulletWidget(char, bulletClass) }).range(
        node.start,
        node.end,
      ),
    );
    return false;
  });

  ranges.sort((a, b) => a.from - b.from);
  return Decoration.set(ranges);
};

const buildTagMarkDecorations = (view: EditorView): DecorationSet => {
  const docText = view.state.doc.toString();
  const tagRanges = findOrgTagRanges(docText, 'inline-body');
  const ranges = tagRanges.map((r) => tagMark.range(r.from, r.to));
  return ranges.length ? Decoration.set(ranges) : Decoration.none;
};

const buildLinkDecorations = (
  view: EditorView,
  getOrgNode: () => OrgNode | null,
): DecorationSet => {
  const orgNode = getOrgNode();
  if (!orgNode) return Decoration.none;

  const caret = view.state.selection.main.head;
  const ranges: Range<Decoration>[] = [];

  walkTree(orgNode, (node: OrgNode): boolean => {
    if (!node.is(NodeType.Link)) return false;

    if (view.hasFocus && caret >= node.start && caret <= node.end) return false;

    const displayNode =
      node.childrenList?.find((c) => c.is(NodeType.LinkName)) ??
      node.childrenList?.find((c) => c.is(NodeType.LinkUrl)) ??
      null;

    if (!displayNode) return false;

    const LINK_BRACKET_LENGTH = 1;
    const textStart = displayNode.start + LINK_BRACKET_LENGTH;
    const textEnd = displayNode.end - LINK_BRACKET_LENGTH;

    if (textStart >= textEnd) return false;

    if (node.start < textStart) {
      ranges.push(invisibleReplace.range(node.start, textStart));
    }
    ranges.push(linkMark.range(textStart, textEnd));
    if (textEnd < node.end) {
      ranges.push(invisibleReplace.range(textEnd, node.end));
    }

    return false;
  });

  ranges.sort((a, b) => a.from - b.from);
  return ranges.length ? Decoration.set(ranges, true) : Decoration.none;
};

/** Whether decorations need a rebuild when orgNode just became available. */
const needsRebuildForOrgNode = (
  decorations: DecorationSet,
  getOrgNode: () => OrgNode | null,
): boolean => decorations === Decoration.none && isPresent(getOrgNode());

const makeMarkupPlugin = (getOrgNode: () => OrgNode | null, singleLine: boolean) =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none;

      constructor(view: EditorView) {
        this.decorations = buildMarkupHideDecorations(view, getOrgNode, singleLine);
      }

      update(update: ViewUpdate): void {
        if (
          update.docChanged ||
          update.viewportChanged ||
          update.focusChanged ||
          update.selectionSet ||
          needsRebuildForOrgNode(this.decorations, getOrgNode)
        ) {
          this.decorations = buildMarkupHideDecorations(update.view, getOrgNode, singleLine);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => view.plugin(plugin)?.decorations ?? Decoration.none),
    },
  );

const makeHeadlinePlugin = (getOrgNode: () => OrgNode | null) =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none;

      constructor(view: EditorView) {
        this.decorations = buildHeadlineOperatorDecorations(view, getOrgNode);
      }

      update(update: ViewUpdate): void {
        if (
          update.docChanged ||
          update.viewportChanged ||
          update.focusChanged ||
          update.selectionSet ||
          needsRebuildForOrgNode(this.decorations, getOrgNode)
        ) {
          this.decorations = buildHeadlineOperatorDecorations(update.view, getOrgNode);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => view.plugin(plugin)?.decorations ?? Decoration.none),
    },
  );

const makeListPlugin = (getOrgNode: () => OrgNode | null, bulletClass: string) =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none;

      constructor() {
        this.decorations = buildListBulletDecorations(getOrgNode, bulletClass);
      }

      update(update: ViewUpdate): void {
        if (
          update.docChanged ||
          update.viewportChanged ||
          needsRebuildForOrgNode(this.decorations, getOrgNode)
        ) {
          this.decorations = buildListBulletDecorations(getOrgNode, bulletClass);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => view.plugin(plugin)?.decorations ?? Decoration.none),
    },
  );

const makeTagPlugin = () =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none;

      constructor(view: EditorView) {
        this.decorations = buildTagMarkDecorations(view);
      }

      update(update: ViewUpdate): void {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = buildTagMarkDecorations(update.view);
        }
      }
    },
    { decorations: (v) => v.decorations },
  );

const makeLinkPlugin = (getOrgNode: () => OrgNode | null) =>
  ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none;

      constructor(view: EditorView) {
        this.decorations = buildLinkDecorations(view, getOrgNode);
      }

      update(update: ViewUpdate): void {
        if (
          update.docChanged ||
          update.viewportChanged ||
          update.focusChanged ||
          update.selectionSet ||
          needsRebuildForOrgNode(this.decorations, getOrgNode)
        ) {
          this.decorations = buildLinkDecorations(update.view, getOrgNode);
        }
      }
    },
    {
      decorations: (v) => v.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => view.plugin(plugin)?.decorations ?? Decoration.none),
    },
  );

export const ORG_LIST_BULLET_CLASS = 'org-list-bullet';
export const ORG_LIST_BULLET_INLINE_CLASS = 'org-list-bullet-inline';

export interface OrgTextRenderingOptions {
  getOrgNode: () => OrgNode | null;
  /**
   * When true all markup/headline operators remain visible (user preference).
   * Returns an empty array so callers can spread safely.
   */
  showSpecialSymbols?: boolean;
  /** Adjusts markup-hide logic: in single-line mode use cursor-range check. */
  singleLine?: boolean;
  /**
   * CSS class applied to list bullet widgets.
   * Use ORG_LIST_BULLET_INLINE_CLASS for embedded editors (no absolute positioning).
   * Defaults to ORG_LIST_BULLET_CLASS (RichEditor-compatible absolute layout).
   */
  bulletClass?: string;
}

/**
 * Returns CodeMirror extensions that visually render org markup:
 * - markup operator hide (*, /, _ etc.) when cursor outside range
 * - headline operator hide (**, **) when cursor off that line
 * - list bullet replacement (- → •)
 * - inline :tag: accent colouring
 * - link decoration (show display text, hide raw syntax)
 */
export const createOrgTextRenderingExtensions = (
  opts: OrgTextRenderingOptions,
): ReturnType<typeof makeMarkupPlugin>[] => {
  if (opts.showSpecialSymbols) return [];

  const bulletClass = opts.bulletClass ?? ORG_LIST_BULLET_CLASS;

  return [
    makeMarkupPlugin(opts.getOrgNode, opts.singleLine ?? false),
    makeHeadlinePlugin(opts.getOrgNode),
    makeListPlugin(opts.getOrgNode, bulletClass),
    makeTagPlugin(),
    makeLinkPlugin(opts.getOrgNode),
  ];
};
