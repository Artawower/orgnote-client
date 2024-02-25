import {
  EditorExtension,
  EditorExtensionParams,
  Extension,
  ExtensionManifest,
  OrgNoteApi,
} from 'orgnote-api';
import { Prec, StateCommand, TransactionSpec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { insertNewlineAndIndent } from '@codemirror/commands';
import { OrgNode, walkTree } from 'org-mode-ast';
import { autoInsertRules } from './auto-insert-rules';

const enterKeypressAutocomplete: EditorExtension = (
  params: EditorExtensionParams
) =>
  Prec.highest(
    keymap.of([
      {
        key: 'Enter',
        run: orgAutoInsertCommand(params.orgNodeGetter),
      },
    ])
  );

export const orgAutoInsertCommand = (
  getOrgNode: () => OrgNode
): StateCommand => {
  return (params) => {
    const { state, dispatch } = params;
    const currentPos = state.selection.main.head;

    let currentOrgNode: OrgNode;

    walkTree(getOrgNode(), (n: OrgNode) => {
      if (n.end === currentPos) {
        currentOrgNode = n;
      }
      return false;
    });

    const transaction = getAutoInsertedSymbol(currentOrgNode);

    if (transaction) {
      const tr = state.update(transaction);
      if (dispatch) dispatch(tr);
      return true;
    }

    return insertNewlineAndIndent({ state, dispatch });
  };
};

function getAutoInsertedSymbol(node: OrgNode): TransactionSpec {
  if (!node) {
    return;
  }

  let transaction: TransactionSpec;
  autoInsertRules.find((r) => {
    transaction = r(node);
    return !!transaction;
  });
  return transaction;
}

export const autocompleteExtension: Extension = {
  onMounted: async (api: OrgNoteApi): Promise<void> => {
    api.editor.extensions.add(enterKeypressAutocomplete);
  },
  onUnmounted: async (api: OrgNoteApi): Promise<void> => {
    api.editor.extensions.remove(enterKeypressAutocomplete);
  },
};

export const autocompleteExtensionManifest: ExtensionManifest = {
  name: 'Smart autocomplete',
  description: 'Autocomplete on enter keypress by current context',
  version: '0.0.1',
  category: 'extension',
  sourceType: 'builtin',
  keywords: ['editor', 'widgets', 'editing'],
};
