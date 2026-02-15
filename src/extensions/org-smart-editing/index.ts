import type { Extension, EditorExtension, EditorExtensionParams } from 'orgnote-api';
import type { StateCommand, TransactionSpec } from '@codemirror/state';
import { Prec } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { keymap } from '@codemirror/view';
import { insertNewlineAndIndent } from '@codemirror/commands';
import { walkTree, type OrgNode } from 'org-mode-ast';
import { enterRules } from './enter-rules';
import {
  PAIRS,
  findPairByOpen,
  isAtLineStart,
  isEscaped,
  hasSpaceOrLineStartBefore,
  isInsideBlock,
  isInsideMarkup,
  isInsideVerbatim,
  type PairConfig,
} from './pair-rules';

const getEnterTransaction = (node: OrgNode | undefined, cursorPos: number): TransactionSpec | undefined => {
  if (!node) return;

  for (const rule of enterRules) {
    const transaction = rule(node, cursorPos);
    if (transaction) return transaction;
  }
};

const createEnterCommand = (getOrgNode: () => OrgNode | null): StateCommand => {
  return ({ state, dispatch }) => {
    const currentPos = state.selection.main.head;
    const rootNode = getOrgNode();

    if (!rootNode) return insertNewlineAndIndent({ state, dispatch });

    let exactMatch: OrgNode | undefined;
    let deepestContaining: OrgNode | undefined;

    walkTree(rootNode, (n: OrgNode) => {
      if (n.end === currentPos) {
        exactMatch = n;
      }
      if (currentPos >= n.start && currentPos <= n.end) {
        deepestContaining = n;
      }
      return false;
    });

    const transaction = getEnterTransaction(exactMatch ?? deepestContaining, currentPos);

    if (transaction) {
      dispatch(state.update(transaction));
      return true;
    }

    return insertNewlineAndIndent({ state, dispatch });
  };
};

type SelectionInfo = {
  from: number;
  to: number;
  hasSelection: boolean;
  selectedText: string;
};

const getSelectionInfo = (view: EditorView): SelectionInfo => {
  const { from, to } = view.state.selection.main;
  const hasSelection = from !== to;
  const selectedText = hasSelection ? view.state.doc.sliceString(from, to) : '';

  return { from, to, hasSelection, selectedText };
};

const shouldSkipPair = (pair: PairConfig, view: EditorView, selection: SelectionInfo): boolean => {
  if (pair.checkNotLineStart && isAtLineStart(view, selection.from)) return true;
  if (isEscaped(view, selection.from)) return true;
  if (!selection.hasSelection && !hasSpaceOrLineStartBefore(view, selection.from)) return true;

  return false;
};

const isInsideSpecialContext = (
  orgNode: OrgNode | null,
  pos: number,
  pair: PairConfig,
): boolean =>
  isInsideBlock(orgNode, pos) || isInsideVerbatim(orgNode, pos) || isInsideMarkup(orgNode, pos, pair);

const buildPairInsert = (pair: PairConfig, selectedText: string): string => {
  if (!selectedText) return `${pair.open}${pair.close}`;
  return `${pair.open}${selectedText}${pair.close}`;
};

const getPairCursorPos = (pair: PairConfig, selection: SelectionInfo): number => {
  if (!selection.hasSelection) return selection.from + pair.open.length;
  return selection.from + pair.open.length + selection.selectedText.length + pair.close.length;
};

const dispatchPairInsert = (
  view: EditorView,
  selection: SelectionInfo,
  insert: string,
  cursorPos: number,
): void => {
  view.dispatch({
    changes: { from: selection.from, to: selection.to, insert },
    selection: { anchor: cursorPos },
  });
};

const createPairHandler = (pair: PairConfig, getOrgNode: () => OrgNode | null) => {
  return (view: EditorView): boolean => {
    const selection = getSelectionInfo(view);
    if (shouldSkipPair(pair, view, selection)) return false;

    const orgNode = getOrgNode();
    if (isInsideSpecialContext(orgNode, selection.from, pair)) return false;

    const insert = buildPairInsert(pair, selection.selectedText);
    const cursorPos = getPairCursorPos(pair, selection);

    dispatchPairInsert(view, selection, insert, cursorPos);

    return true;
  };
};

const handleBackspace = (view: EditorView): boolean => {
  const { state } = view;
  const { from, to } = state.selection.main;

  if (from !== to || from === 0) return false;

  const charBefore = state.doc.sliceString(from - 1, from);
  const charAfter = state.doc.sliceString(from, from + 1);

  const pair = findPairByOpen(charBefore);
  if (!pair || charAfter !== pair.close) return false;

  view.dispatch({
    changes: { from: from - 1, to: from + 1, insert: '' },
    selection: { anchor: from - 1 },
  });

  return true;
};

const createKeymap = (getOrgNode: () => OrgNode | null) => {
  const pairHandlers = PAIRS.map((pair) => ({
    key: pair.open,
    run: createPairHandler(pair, getOrgNode),
  }));

  return [
    { key: 'Enter', run: createEnterCommand(getOrgNode) },
    { key: 'Backspace', run: handleBackspace },
    ...pairHandlers,
  ];
};

const smartEditingExtension: EditorExtension = (params: EditorExtensionParams) =>
  Prec.highest(keymap.of(createKeymap(params.orgNodeGetter)));

export const orgSmartEditingExtension: Extension = {
  onMounted: async (api) => {
    const { addExtensions } = api.core.useEditor();
    addExtensions(smartEditingExtension);
  },

  onUnmounted: async (api) => {
    const { removeExtensions } = api.core.useEditor();
    removeExtensions(smartEditingExtension);
  },
};

export { orgSmartEditingManifest } from './manifest';
