import { NodeType } from 'org-mode-ast';

export type LineClass = string;
export type OrgLineDecorations = { [key in NodeType]?: LineClass };
