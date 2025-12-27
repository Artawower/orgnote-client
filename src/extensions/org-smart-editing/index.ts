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

const getEnterTransaction = (node: OrgNode | undefined): TransactionSpec | undefined => {
  if (!node) return;

  for (const rule of enterRules) {
    const transaction = rule(node);
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

    const transaction = getEnterTransaction(exactMatch ?? deepestContaining);

    if (transaction) {
      dispatch(state.update(transaction));
      return true;
    }

    return insertNewlineAndIndent({ state, dispatch });
  };
};

const createPairHandler = (pair: PairConfig, getOrgNode: () => OrgNode | null) => {
  return (view: EditorView): boolean => {
    const { state } = view;
    const { from, to } = state.selection.main;
    const hasSelection = from !== to;

    if (pair.checkNotLineStart && isAtLineStart(view, from)) {
      return false;
    }

    if (isEscaped(view, from)) {
      return false;
    }

    if (!hasSelection && !hasSpaceOrLineStartBefore(view, from)) {
      return false;
    }

    const orgNode = getOrgNode();

    if (isInsideBlock(orgNode, from)) {
      return false;
    }

    if (isInsideVerbatim(orgNode, from)) {
      return false;
    }

    if (isInsideMarkup(orgNode, from, pair)) {
      return false;
    }

    const selectedText = hasSelection ? state.doc.sliceString(from, to) : '';

    const insert = hasSelection
      ? `${pair.open}${selectedText}${pair.close}`
      : `${pair.open}${pair.close}`;

    const cursorPos = hasSelection ? from + selectedText.length + 2 : from + 1;

    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: cursorPos },
    });

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
