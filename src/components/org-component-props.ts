export interface OrgComponentProps {
  node: OrgNode;
  editorView?: EditorView;
  rootNodeSrc?: () => OrgNode;
  readonly?: boolean;
}
