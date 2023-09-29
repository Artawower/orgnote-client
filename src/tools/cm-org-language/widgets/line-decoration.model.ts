import { NodeType, OrgNode } from 'org-mode-ast';

export type OrgLineClass = string | ((orgNode: OrgNode) => string);
export type OrgLineClasses = { [key in NodeType]?: OrgLineClass };
