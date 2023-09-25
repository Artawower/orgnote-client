import { Parser } from '@lezer/common';
import { OrgNode } from 'org-mode-ast';

export interface OrgModeParserConfig {
  orgAstChanged?: (arg: OrgNode) => void;
  wrap?: {
    [langName: string]: Parser;
  };
}
