import { foldInside, foldNodeProp } from '@codemirror/language';
import { NodeType } from 'org-mode-ast';

export const orgFoldProps = foldNodeProp.add({
  [NodeType.Headline]: foldInside,
});
