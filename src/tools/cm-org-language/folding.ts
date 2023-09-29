import { foldNodeProp } from '@codemirror/language';
import { NodeType } from 'org-mode-ast';

export const orgFoldProps = foldNodeProp.add({
  [NodeType.Headline]: (context) => {
    if (context.node.name !== NodeType.Headline) {
      return null;
    }
    const sectionChild = context.lastChild;
    const foldRange = { from: sectionChild.from - 1, to: sectionChild.to };
    return foldRange;
  },
});
