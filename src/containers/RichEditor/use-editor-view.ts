import { EditorView } from '@codemirror/view';
import { useEditorState, type UseEditorStateOptions } from './use-editor-state';

export type UseEditorViewOptions = Omit<UseEditorStateOptions, 'editorViewGetter'>;

export const useEditorView = (options: UseEditorViewOptions) => {
  let editorView: EditorView | undefined;

  const getEditorView = () => editorView;

  const {
    orgNode,
    createState,
    reconfigureReadonly,
    setupWidgetsWatcher,
  } = useEditorState({
    ...options,
    editorViewGetter: getEditorView,
  });

  const initView = (parent: HTMLElement, content: string): EditorView => {
    editorView = new EditorView({
      state: createState(content),
      parent,
    });

    setupWidgetsWatcher(getEditorView);

    return editorView;
  };

  const destroyView = (): void => {
    editorView?.destroy();
    editorView = undefined;
  };

  const updateContent = (content: string): void => {
    if (!editorView) return;

    const currentContent = editorView.state.doc.toString();
    if (currentContent === content) return;

    editorView.dispatch({
      changes: {
        from: 0,
        to: currentContent.length,
        insert: content,
      },
    });
  };

  const setReadonly = (value: boolean): void => {
    if (!editorView) return;
    reconfigureReadonly(editorView, value);
  };

  return {
    orgNode,
    getEditorView,
    initView,
    destroyView,
    updateContent,
    setReadonly,
  };
};
