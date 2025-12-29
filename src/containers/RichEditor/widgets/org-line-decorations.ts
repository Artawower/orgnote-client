import type { EditorView } from '@codemirror/view';
import type { Range } from '@codemirror/state';
import type { DecorationSet, ViewUpdate } from '@codemirror/view';
import { Decoration, ViewPlugin } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';
import { NodeType, findParent, walkTree } from 'org-mode-ast';
import type { OrgLineClasses, OrgLineClass } from 'orgnote-api';
import { orgNodeGetterFacet, lineClassesFacet } from '../facets';

const applyLineDecorationsForSrcParentBlock = (
  lineDecorations: Range<Decoration>[],
  node: OrgNode,
  lineClass: string,
): void => {
  const srcParent = findParent(node, (n) => n.is(NodeType.SrcBlock));
  if (!srcParent) return;

  const linedValues = node.value?.split('\n');
  let pos = node.start;

  linedValues?.forEach((v) => {
    const lineDecoration = Decoration.line({
      class: lineClass,
    }).range(pos, pos);
    pos += v.length + 1;
    lineDecorations.push(lineDecoration);
  });
};

const collectLineClasses = (
  widgets: OrgLineClass[] | undefined,
  node: OrgNode,
): string | undefined => {
  if (!widgets?.length) return undefined;

  const classes = widgets
    .map((w) => {
      const lineClass = typeof w.class === 'function' ? w.class(node) : w.class;
      return lineClass;
    })
    .filter(Boolean);

  return classes.length > 0 ? classes.join(' ') : undefined;
};

const buildLineDecorations = (
  orgNode: OrgNode | null,
  orgLineClasses: OrgLineClasses,
): DecorationSet => {
  if (!orgNode) return Decoration.none;

  const lineDecorations: Range<Decoration>[] = [];

  walkTree(orgNode, (n: OrgNode): boolean => {
    const lineClass = collectLineClasses(orgLineClasses[n.type], n);
    if (!lineClass) return false;

    applyLineDecorationsForSrcParentBlock(lineDecorations, n, lineClass);

    lineDecorations.push(Decoration.line({ class: lineClass }).range(n.start, n.start));

    return false;
  });

  lineDecorations.sort((p, c) => p.from - c.from);
  return Decoration.set(lineDecorations);
};

export const orgLineDecoration = ViewPlugin.fromClass(
  class {
    public decorations: DecorationSet = Decoration.none;
    private lastPosition = 0;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    private buildDecorations(view: EditorView): DecorationSet {
      const getOrgNode = view.state.facet(orgNodeGetterFacet);
      const lineClasses = view.state.facet(lineClassesFacet);
      return buildLineDecorations(getOrgNode(), lineClasses);
    }

    public update(update: ViewUpdate): void {
      const caretPosition = update.state.selection.main.head;
      const caretPositionChanged = this.lastPosition !== caretPosition;
      this.lastPosition = caretPosition;

      if (update.docChanged || update.viewportChanged || caretPositionChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);
