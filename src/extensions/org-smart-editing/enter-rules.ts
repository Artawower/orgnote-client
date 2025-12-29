import type { TransactionSpec } from '@codemirror/state';
import { NodeType, findParent, type OrgNode } from 'org-mode-ast';

const ORG_OPERATOR_REGEXP = /(\* |- |\+ |\d+[).]{1})/;

const clearEmptyHeadline = (node: OrgNode): TransactionSpec | undefined => {
  if (!node.is(NodeType.Operator)) return;

  const title = node.parent;
  if (!title?.is(NodeType.Title)) return;

  const headline = title.parent;
  if (!headline?.is(NodeType.Headline)) return;

  const children = title.children ? [...title.children] : [];
  const hasContent = children.some(
    (n) => n.isNot(NodeType.Operator) && n.rawValue.trim().length > 0,
  );
  if (hasContent) return;

  return {
    changes: { from: headline.start, to: headline.end, insert: '' },
    selection: { anchor: headline.start },
  };
};

const newLineAfterEmptyBullet = (node: OrgNode): TransactionSpec | undefined => {
  if (!node.is(NodeType.Operator) || !node.rawValue.match(ORG_OPERATOR_REGEXP)) {
    return;
  }
  return {
    changes: { from: node.start, to: node.end, insert: '' },
  };
};

const newListItem = (node: OrgNode): TransactionSpec | undefined => {
  const parentListItem = findParent(node, (n) => {
    if (n.isNot(NodeType.Title)) return false;
    if (n.parent?.isNot(NodeType.ListItem)) return [false, true];
    return true;
  });

  if (node.is(NodeType.NewLine) || !node.parent?.parent || !parentListItem) {
    return;
  }

  const firstChild = parentListItem.children.first;
  if (!firstChild) return;

  const operator = firstChild.rawValue.trim();
  const checkbox = parentListItem.children?.get(1)?.is(NodeType.Checkbox) ? '[ ] ' : '';
  const isNumberList = operator.match(/\d+[).]{1}/);
  const newOperator = isNumberList
    ? +operator.slice(0, -1) + 1 + operator.slice(-1)
    : operator;

  const insert = `\n${newOperator} ${checkbox}`;

  return {
    changes: { from: node.end, insert },
    selection: { anchor: node.end + insert.length },
  };
};

const blockFooter = (node: OrgNode): TransactionSpec | undefined => {
  if (
    node.parent?.isNot(NodeType.Keyword) ||
    !node.rawValue.toLowerCase().startsWith('#+begin_')
  ) {
    return;
  }

  const keyword = node.rawValue.toLowerCase().split(' ')[0]?.replace('#+begin_', '') ?? '';

  return {
    changes: { from: node.end, insert: `\n\n#+end_${keyword}` },
    selection: { anchor: node.end + 1 },
  };
};

const BLOCK_TYPES = [
  NodeType.SrcBlock,
  NodeType.QuoteBlock,
  NodeType.ExampleBlock,
  NodeType.ExportBlock,
  NodeType.CommentBlock,
] as const;

const isBlockType = (node: OrgNode): boolean =>
  BLOCK_TYPES.some((type) => node.is(type));

const exitBlockOnNewLine = (node: OrgNode): TransactionSpec | undefined => {
  const parent = node.parent;

  if (node.isNot(NodeType.NewLine) || !parent || !isBlockType(parent)) {
    return;
  }

  const prevSibling = node.prev;
  const isAfterBlockBody = prevSibling?.is(NodeType.BlockBody);
  if (!isAfterBlockBody) return;

  return {
    changes: [
      { from: node.start, to: node.end, insert: '' },
      { from: parent.end, insert: '\n' },
    ],
    selection: { anchor: parent.end },
  };
};

const exitList = (node: OrgNode): TransactionSpec | undefined => {
  const titleParent = findParent(node, (n) => {
    if (n.isNot(NodeType.Title)) return false;
    if (n.parent?.isNot(NodeType.ListItem)) return [false, true];
    return true;
  });

  if (!titleParent) return;

  const listItem = node.parent?.parent;
  if (!listItem) return;

  const isCheckList = titleParent?.children.get(1)?.is(NodeType.Checkbox);
  const rawValue = titleParent.children
    ?.slice(isCheckList ? 2 : 1)
    .map((n: OrgNode) => n.rawValue)
    .join('')
    .trim();

  if (rawValue) return;

  return {
    changes: { from: listItem.start, to: node.end, insert: '\n' },
    selection: { anchor: listItem.start },
  };
};

const exitIndentedBlock = (node: OrgNode): TransactionSpec | undefined => {
  if (node.isNot(NodeType.Indent)) return;

  return {
    changes: { from: node.start, to: node.end, insert: '' },
    selection: { anchor: node.start },
  };
};

const exitBlockOnEmptyLines = (node: OrgNode): TransactionSpec | undefined => {
  const parent = node.parent;
  const grandParent = parent?.parent;

  if (
    node.isNot(NodeType.Text) ||
    !parent?.is(NodeType.BlockBody) ||
    !grandParent ||
    !isBlockType(grandParent)
  ) {
    return;
  }

  const trailingNewlines = node.value.match(/\n{2,}$/);
  if (!trailingNewlines) return;

  const newlinesToRemove = trailingNewlines[0].length;
  const contentEnd = node.end - newlinesToRemove;

  return {
    changes: [
      { from: contentEnd, to: node.end, insert: '' },
      { from: grandParent.end, insert: '\n' },
    ],
    selection: { anchor: grandParent.end - newlinesToRemove + 1 },
  };
};

const indentListItemSection = (node: OrgNode): TransactionSpec | undefined => {
  const parentSection = findParent(node, (n) => {
    if (n.isNot(NodeType.Section)) return false;
    if (!n.parent?.is(NodeType.ListItem)) return [false, true];
    return true;
  });

  if (!parentSection) return;

  return {
    changes: { from: node.end, to: node.end, insert: '\n ' },
    selection: { anchor: node.end + 2 },
  };
};

const isEmptyTableRow = (tableRow: OrgNode): boolean => {
  const content = tableRow.rawValue.replace(/\|/g, '').replace(/\s/g, '');
  return content.length === 0;
};

const exitEmptyTableRow = (node: OrgNode): TransactionSpec | undefined => {
  const tableRow = findParent(node, (n) => n.is(NodeType.TableRow));
  if (!tableRow) return;

  if (!isEmptyTableRow(tableRow)) return;

  const table = tableRow.parent;
  if (!table?.is(NodeType.Table)) return;

  const prevNewLine = tableRow.prev?.is(NodeType.NewLine) ? tableRow.prev : null;
  const deleteFrom = prevNewLine?.start ?? tableRow.start;

  return {
    changes: { from: deleteFrom, to: tableRow.end, insert: '\n' },
    selection: { anchor: deleteFrom + 1 },
  };
};

const newTableRow = (node: OrgNode): TransactionSpec | undefined => {
  const tableRow = findParent(node, (n) => n.is(NodeType.TableRow));
  if (!tableRow) return;

  const table = tableRow.parent;
  if (!table?.is(NodeType.Table)) return;

  const isRowClosed = tableRow.rawValue.trimEnd().endsWith('|');
  const closingPipe = isRowClosed ? '' : ' |';

  const insert = `${closingPipe}\n|  |`;
  const cursorOffset = closingPipe.length + 3;

  return {
    changes: { from: node.end, insert },
    selection: { anchor: node.end + cursorOffset },
  };
};

export const enterRules = [
  clearEmptyHeadline,
  exitList,
  exitBlockOnEmptyLines,
  newLineAfterEmptyBullet,
  newListItem,
  blockFooter,
  exitBlockOnNewLine,
  exitIndentedBlock,
  indentListItemSection,
  exitEmptyTableRow,
  newTableRow,
] as const;
