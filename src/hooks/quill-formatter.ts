import { NodeType, OrgNode, walkTree } from 'org-mode-ast';
import Quill, { StringMap } from 'quill';
import { getFormatConfig } from 'src/tools/quill-formatter/formatter-configs';
import { getFormatRange } from 'src/tools/quill-formatter/formatter-ranges';

type Formatters = { [key: string]: StringMap };

export function useQuillFormatter() {
  let quill: Quill;
  let lastFormatters: Formatters = {};

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

  const removeFormatters = (formatters: Formatters): void => {
    Object.keys(formatters).forEach((key) => {
      const [start, end] = key.split('-').map((n) => +n);
      quill.removeFormat(start, end - start, 'api');
    });
  };

  const getDeletedFormatters = (newFormatters: Formatters): Formatters => {
    const deletedFormatters: Formatters = {};
    Object.keys(lastFormatters).forEach((key) => {
      if (!newFormatters[key]) {
        deletedFormatters[key] = lastFormatters[key];
      }
    });
    return deletedFormatters;
  };

  const applyFormatters = (formatters: Formatters): void => {
    Object.keys(formatters).forEach((key) => {
      const formatter = formatters[key];
      const [start, end] = key.split('-').map((n) => +n);
      quill?.formatText(start, end - start, formatter, 'api');
    });
  };

  const clearLastFormatter = (orgNode: OrgNode, insertPositoin?: number) => {
    if (!insertPositoin) {
      return;
    }
    quill.removeFormat(insertPositoin, 1, 'api');
  };

  const prettifyText = (
    orgNode: OrgNode,
    specialSymbols: boolean,
    insertPosition?: number
  ): void => {
    // TODO: master this method too slow. Cause it reformat multiple times with real dom.
    // Consider to use smth like transaction https://github.com/quilljs/quill/issues/1021
    clearLastFormatter(orgNode, insertPosition);
    const newFormatters = getFormatters(orgNode, specialSymbols);
    const deletedFormatters = getDeletedFormatters(newFormatters);
    removeFormatters(deletedFormatters);
    applyFormatters(newFormatters);
    lastFormatters = newFormatters;
  };

  return {
    quill,

    initQuill,
    prettifyText,
  };
}
