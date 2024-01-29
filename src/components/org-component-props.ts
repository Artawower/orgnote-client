import { EditorView } from 'codemirror';
import { OrgNode } from 'org-mode-ast';

export interface OrgComponentProps {
  node: OrgNode;
  editorView?: EditorView;
  rootNodeSrc?: () => OrgNode;
  readonly?: boolean;
}
