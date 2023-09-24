import { OrgNode } from 'org-mode-ast';

export interface OrgModeParserConfig {
  orgAstChanged?: (arg: OrgNode) => void,
}
