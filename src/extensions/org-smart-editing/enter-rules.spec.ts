import { test, expect } from 'vitest';
import { parse, withMetaInfo, walkTree, type OrgNode } from 'org-mode-ast';
import { enterRules } from './enter-rules';

const createOrgTree = (doc: string): OrgNode => withMetaInfo(parse(doc));

const findNodeAtPosition = (root: OrgNode, pos: number): OrgNode | undefined => {
  let exactMatch: OrgNode | undefined;
  let deepestContaining: OrgNode | undefined;

  walkTree(root, (n) => {
    if (n.end === pos) exactMatch = n;
    if (pos >= n.start && pos <= n.end) deepestContaining = n;
    return false;
  });

  return exactMatch ?? deepestContaining;
};

const applyEnterRules = (doc: string, cursorPos: number) => {
  const root = createOrgTree(doc);
  const node = findNodeAtPosition(root, cursorPos);
  if (!node) return undefined;

  for (const rule of enterRules) {
    const transaction = rule(node);
    if (transaction) return transaction;
  }
  return undefined;
};

test('clearEmptyHeadline removes empty headline when cursor after stars', () => {
  const doc = '* ';
  const result = applyEnterRules(doc, 2);

  expect(result).toBeDefined();
  expect(result?.changes).toEqual({ from: 0, to: 2, insert: '' });
});

test('clearEmptyHeadline does not remove headline with content', () => {
  const doc = '* Hello';
  const result = applyEnterRules(doc, 7);

  expect(result).toBeUndefined();
});

test('newListItem creates new list item after existing item', () => {
  const doc = '- item';
  const result = applyEnterRules(doc, 6);

  expect(result).toBeDefined();
  expect(result?.changes).toEqual({ from: 6, insert: '\n- ' });
});

test('newListItem creates numbered list item with incremented number', () => {
  const doc = '1. first';
  const result = applyEnterRules(doc, 8);

  expect(result).toBeDefined();
  expect(result?.changes).toEqual({ from: 8, insert: '\n2. ' });
});

test('newListItem preserves checkbox in list', () => {
  const doc = '- [ ] task';
  const result = applyEnterRules(doc, 10);

  expect(result).toBeDefined();
  expect(result?.changes).toEqual({ from: 10, insert: '\n- [ ] ' });
});

test('exitList removes empty list item', () => {
  const doc = '- item\n- ';
  const result = applyEnterRules(doc, 9);

  expect(result).toBeDefined();
});

test('blockFooter adds end block after begin', () => {
  const doc = '#+begin_src';
  const result = applyEnterRules(doc, 11);

  expect(result).toBeDefined();
  expect(result?.changes).toEqual({ from: 11, insert: '\n\n#+end_src' });
});

test('newTableRow creates new row in table', () => {
  const doc = '| a | b |';
  const result = applyEnterRules(doc, 9);

  expect(result).toBeDefined();
  expect(result?.changes).toEqual({ from: 9, insert: '\n|  |' });
});

test('exitEmptyTableRow removes empty table row', () => {
  const doc = '| a |\n|  |';
  const root = createOrgTree(doc);
  const node = findNodeAtPosition(root, 9);

  expect(node).toBeDefined();

  let transaction;
  for (const rule of enterRules) {
    transaction = rule(node!);
    if (transaction) break;
  }

  expect(transaction).toBeDefined();
});

test('exitBlockOnNewLine exits src block on empty line after content', () => {
  const doc = '#+begin_src js\nconsole.log("test")\n\n#+end_src';
  const result = applyEnterRules(doc, 36);

  expect(result).toBeDefined();
  expect(result?.changes).toContainEqual({ from: 35, to: 36, insert: '' });
});

test('exitBlockOnNewLine exits quote block on empty line', () => {
  const doc = '#+begin_quote\nsome text\n\n#+end_quote';
  const result = applyEnterRules(doc, 25);

  expect(result).toBeDefined();
});

test('exitBlockOnEmptyLines exits when multiple empty lines at end of content', () => {
  const doc = '#+begin_src python\nprint\n\n#+end_src';
  const result = applyEnterRules(doc, 26);

  expect(result).toBeDefined();
});
