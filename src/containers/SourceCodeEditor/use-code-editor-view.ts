import { EditorView } from '@codemirror/view';
import { useCodeEditorState, type UseCodeEditorStateOptions } from './use-code-editor-state';

export type UseCodeEditorViewOptions = Omit<UseCodeEditorStateOptions, 'editorViewGetter'>;

export const useCodeEditorView = (options: UseCodeEditorViewOptions) => {
  let editorView: EditorView | undefined;

  const getEditorView = () => editorView;

  const { createState, reconfigureReadonly, reconfigureLanguage, reconfigureTheme } = useCodeEditorState({
    ...options,
    editorViewGetter: getEditorView,
  });

  const initView = (parent: HTMLElement, content: string): EditorView => {
    editorView = new EditorView({
      state: createState(content),
      parent,
    });

    editorView.focus();
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

  const setLanguage = (language?: string): void => {
    if (!editorView) return;
    reconfigureLanguage(editorView, language);
  };

  const setTheme = (isDark?: boolean): void => {
    if (!editorView) return;
    reconfigureTheme(editorView, isDark);
  };

  return {
    getEditorView,
    initView,
    destroyView,
    updateContent,
    setReadonly,
    setLanguage,
    setTheme,
  };
};
