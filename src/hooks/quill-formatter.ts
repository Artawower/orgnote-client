import { NodeType, OrgNode, walkTree } from 'org-mode-ast';
import Quill, { StringMap } from 'quill';
import { getFormatConfig } from 'src/tools/quill-formatter/formatter-configs';
import { getFormatRange } from 'src/tools/quill-formatter/formatter-ranges';

type Formatters = { [key: string]: StringMap };

export function useQuillFormatter() {
  let quill: Quill;
  // let lastFormatters: Formatters = {};

  const initQuill = (q: Quill) => {
    quill = q;
  };

  const nodeKey = (node: OrgNode) => {
    const [start, end] = getFormatRange(node);
    return `${start}-${end}`;
  };

  const getFormatters = (
    orgNode: OrgNode,
    specialSymbols: boolean
  ): Formatters => {
    const formatters: Formatters = {};
    walkTree(orgNode, (n: OrgNode) => {
      if (!n || n.is(NodeType.NewLine)) {
        return false;
      }
      const formatConfig = getFormatConfig(n, specialSymbols);
      if (!formatConfig) {
        return;
      }
      formatters[nodeKey(n)] = formatConfig;
    });
    return formatters;
  };

  const applyFormatters = (formatters: Formatters): void => {
    Object.keys(formatters).forEach((key) => {
      const formatter = formatters[key];
      const [start, end] = key.split('-').map((n) => +n);
      quill?.formatText(start, end - start, formatter, 'api');
    });
  };

  const clearLastFormatter = (insertPositoin?: number) => {
    if (!insertPositoin) {
      return;
    }
    quill.removeFormat(insertPositoin, 1, 'api');
  };

  const prettifyText = (
    specialSymbols: boolean,
    insertPosition?: number,
    ...orgNodes: OrgNode[]
  ): void => {
    clearLastFormatter(insertPosition);

    orgNodes.forEach((n) => {
      const formatters = getFormatters(n, specialSymbols);
      applyFormatters(formatters);
    });
  };

  return {
    quill,

    initQuill,
    prettifyText,
  };
}
