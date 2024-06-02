import { foldEffect } from '@codemirror/language';
import { StateEffect } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { NodeType, OrgNode, walkTree } from 'org-mode-ast';

export const orgInitialFoldingExtension = (
  editorViewGetter: () => EditorView,
  orgNodeGetter: () => OrgNode
) => {
  let inited = false;
  return EditorView.updateListener.of(() => {
    if (inited) {
      return;
    }
    inited = true;
    const orgNode = orgNodeGetter();
    const startupFolding = orgNode.meta.startup as string;

    const editorView = editorViewGetter();
    const level = getLevelByStartup(startupFolding);

    if (!level) {
      return;
    }

    const foldingRanges = findFoldingRanges(orgNode, level);

    const effects: StateEffect<unknown>[] = foldingRanges.map(([from, to]) =>
      foldEffect.of({
        from,
        to,
      })
    );
    editorView.dispatch({ effects });
  });
};

const levelRegexp = /show(\d+)levels/;
function getLevelByStartup(startup?: string): number {
  if (!startup) {
    return;
  }
  const match = startup.match(levelRegexp);
  if (match) {
    return parseInt(match[1]);
  }
  if (startup === 'showeverything') {
    return;
  }
  if (startup === 'overview') {
    return 1;
  }

  if (startup === 'content') {
    return 100;
  }
  return 0;
}

function findFoldingRanges(
  orgNode: OrgNode,
  level: number
): [number, number][] {
  const rangeStack: { level: number; from: number }[] = [];
  const ranges: [number, number][] = [];
  const addRange = (from: number, to: number) =>
    from !== to && ranges.push([from, to]);
  walkTree(orgNode, (node: OrgNode) => {
    if (node.isNot(NodeType.Headline)) {
      return false;
    }
    const lastRange = rangeStack[rangeStack.length - 1];

    if (node.level > level) {
      return;
    }

    if (lastRange) {
      const r = rangeStack.pop();
      addRange(r.from, node.start - 1);
    }
    if (!node.section) {
      return;
    }
    rangeStack.push({ level: node.level, from: node.section.start - 1 });
  });

  const lastRange = rangeStack[rangeStack.length - 1];
  if (lastRange) {
    ranges.push([lastRange.from, orgNode.end]);
  }

  return ranges;
}
