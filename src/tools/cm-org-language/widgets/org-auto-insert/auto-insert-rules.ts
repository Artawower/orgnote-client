import { TransactionSpec } from '@codemirror/state';
import { NodeType, OrgNode } from 'org-mode-ast';

export function newLineAfterEmptyBullet(node: OrgNode): TransactionSpec {
  const orgOperatorRegexp = /(\- |\+ |\d+[\)\.]{1})/;
  if (!node.is(NodeType.Operator) || !node.rawValue.match(orgOperatorRegexp)) {
    return;
  }
  return {
    changes: { from: node.start, to: node.end, insert: '' },
  };
}

export function newListItem(node: OrgNode): TransactionSpec {
  if (
    node.is(NodeType.NewLine) ||
    !node.parent ||
    !node.parent.parent ||
    node.parent?.parent?.isNot(NodeType.ListItem) ||
    node.parent?.is(NodeType.Section)
  ) {
    return;
  }
  const operator = node.parent.children.first.rawValue.trim();

  const checkbox = node.parent.children?.get(1)?.is(NodeType.Checkbox)
    ? '[ ]'
    : '';

  const isNumberList = operator.match(/\d+[\)\.]{1}/);
  const newOperator = isNumberList
    ? +operator.slice(0, -1) + 1 + operator.slice(-1)
    : operator;

  const insert = `\n${newOperator} ${checkbox} `;

  return {
    changes: { from: node.end, insert },
    selection: { anchor: node.end + insert.length },
  };
}

export function blockFooter(node: OrgNode): TransactionSpec {
  if (
    node.parent?.isNot(NodeType.Keyword) ||
    !node.rawValue.toLowerCase().startsWith('#+begin_')
  ) {
    return;
  }
  const keyword = node.rawValue
    .toLowerCase()
    .split(' ')[0]
    .replace('#+begin_', '');
  return {
    changes: { from: node.end, insert: `\n\n#+end_${keyword}` },
    selection: { anchor: node.end + 1 },
  };
}

export function exitCodeBlock(node: OrgNode): TransactionSpec {
  if (
    node.isNot(NodeType.NewLine) ||
    node.parent?.isNot(NodeType.BlockBody) ||
    node.parent?.parent?.isNot(NodeType.QuoteBlock)
  ) {
    return;
  }
  return {
    changes: [
      { from: node.end - 1, to: node.end, insert: '' },
      { from: node.parent.parent.end, insert: '\n' },
    ],
    selection: { anchor: node.parent.parent.end },
  };
}

export function exitList(node: OrgNode): TransactionSpec {
  if (
    node.is(NodeType.NewLine) ||
    (node.is(NodeType.Text) && !!node.value.trim()) ||
    !node.parent?.parent?.is(NodeType.ListItem)
  ) {
    return;
  }
  return {
    changes: { from: node.parent?.parent.start, to: node.end, insert: '\n' },
    selection: { anchor: node.parent?.parent.start },
  };
}
export function exitIndentedBlock(node: OrgNode): TransactionSpec {
  if (node.isNot(NodeType.Indent)) {
    return;
  }
  return {
    changes: { from: node.start, to: node.end, insert: '' },
    selection: { anchor: node.start },
  };
}

export function exitSrcBlock(node: OrgNode): TransactionSpec {
  if (
    node.isNot(NodeType.Text) ||
    node.parent?.isNot(NodeType.BlockBody) ||
    node.value.length < 2 ||
    !!node.value.replaceAll('\n', '')
  ) {
    return;
  }

  return {
    changes: [
      { from: node.start, to: node.end, insert: '' },
      {
        from: node.parent.parent.end,
        insert: '\n',
      },
    ],
    selection: { anchor: node.parent.parent.end - node.value.length + 1 },
  };
}

export const autoInsertRules = [
  exitList,
  exitSrcBlock,
  newLineAfterEmptyBullet,
  newListItem,
  blockFooter,
  exitCodeBlock,
  exitIndentedBlock,
] as const;
