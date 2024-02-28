import type {
  EditorExtension,
  EditorExtensionParams,
  Extension,
  ExtensionManifest,
  OrgNoteApi,
} from 'orgnote-api';
import { codeFolding } from '@codemirror/language';
import { Extension as CmExtension } from '@codemirror/state';
import { orgFolding, orgFoldingField } from './org-folding';
import { orgInitialFoldingExtension } from './org-initial-folding';

const editorFoldingExtension: EditorExtension = () => codeFolding();

const initialFoldingExtension: EditorExtension = (
  params: EditorExtensionParams
) => orgInitialFoldingExtension(params.editorViewGetter, params.orgNodeGetter);

const headlineFoldingEditorExtension: EditorExtension = (
  params: EditorExtensionParams
) => {
  const extensions: CmExtension[] = [];
  if (params.foldWidget) {
    extensions.push(
      orgFolding(
        params.orgNodeGetter,
        params.editorViewGetter,
        params.foldWidget
      ),
      orgFoldingField
    );
  }
  return extensions;
};

export const foldingExtension: Extension = {
  onMounted: async (api: OrgNoteApi): Promise<void> => {
    api.editor.extensions.add(
      editorFoldingExtension,
      headlineFoldingEditorExtension,
      initialFoldingExtension
    );
  },
  onUnmounted: async (api: OrgNoteApi): Promise<void> => {
    api.editor.extensions.remove(
      editorFoldingExtension,
      headlineFoldingEditorExtension,
      initialFoldingExtension
    );
  },
};

export const foldingExtensionManifest: ExtensionManifest = {
  name: 'Editor folding',
  description: 'Enable ability to fold headlines and source code in the editor',
  version: '0.0.1',
  category: 'extension',
  sourceType: 'builtin',
  keywords: ['editor', 'headlines', 'folding'],
};
