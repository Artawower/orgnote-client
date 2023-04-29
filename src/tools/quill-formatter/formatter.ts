import { OrgNode, walkTree } from 'org-mode-ast';
import Quill from 'quill';
import { getFormatConfig } from './formatter-configs';
import { getFormatRange } from './formatter-ranges';

export const clearQuillFormat = (quill: Quill): void => {
  quill.removeFormat(0, quill.getLength() - 1, 'api');
};

export const prettifyEditorText = (
  quill: Quill,
  orgNode?: OrgNode,
  specialSymbolsHidden = false
): void => {
  if (!orgNode) {
    return;
  }
  clearQuillFormat(quill);
  walkTree(orgNode, (n: OrgNode) => {
    const formatConfig = getFormatConfig(n, specialSymbolsHidden);
    const range = getFormatRange(n);
    const [start, end] = range;
    if (formatConfig) {
      quill.formatText(start, end - start, formatConfig, 'api');
    }
    return false;
  });
};
