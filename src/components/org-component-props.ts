import { EditorView } from '@codemirror/view';
import { OrgNode } from 'org-mode-ast';

export interface OrgComponentProps {
  node: OrgNode;
  editorView?: EditorView;
  rootNodeSrc?: () => OrgNode;
  readonly?: boolean;
}
