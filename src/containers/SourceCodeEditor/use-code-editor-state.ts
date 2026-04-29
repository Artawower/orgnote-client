import { Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView, highlightActiveLine, keymap, lineNumbers } from '@codemirror/view';
import { closeBrackets, autocompletion } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, indentOnInput, foldGutter, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { loadLanguage, type LanguageName } from '@uiw/codemirror-extensions-langs';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { markdownHeadingDecorations } from './markdown-heading-decorations';
import { markdownLinkDecorations } from './markdown-link-decorations';

export interface UseCodeEditorStateOptions {
  readonly?: boolean;
  language?: string;
  isDark?: boolean;
  editorViewGetter: () => EditorView | undefined;
  onContentUpdate: (content: string) => void;
}

const LANGUAGE_MAP: Record<string, LanguageName> = {
  ts: 'ts',
  typescript: 'ts',
  js: 'js',
  javascript: 'js',
  jsx: 'jsx',
  tsx: 'tsx',
  json: 'json',
  toml: 'toml',
  yaml: 'yaml',
  yml: 'yaml',
  html: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  py: 'py',
  python: 'py',
  rs: 'rs',
  rust: 'rs',
  go: 'go',
  java: 'java',
  kt: 'kt',
  kotlin: 'kt',
  c: 'c',
  cpp: 'cpp',
  'c++': 'cpp',
  cs: 'cs',
  csharp: 'cs',
  rb: 'rb',
  ruby: 'rb',
  php: 'php',
  sql: 'sql',
  sh: 'sh',
  bash: 'bash',
  shell: 'sh',
  vue: 'vue',
  xml: 'xml',
  md: 'md',
  markdown: 'md',
};

const getLanguageExtension = (language?: string): Extension[] => {
  if (!language) return [];

  const langName = LANGUAGE_MAP[language.toLowerCase()];
  if (!langName) return [];

  const langSupport = loadLanguage(langName);
  return langSupport ? [langSupport] : [];
};

const getThemeExtension = (isDark?: boolean): Extension => isDark ? githubDark : githubLight;

const MARKDOWN_LANGUAGES = new Set(['md', 'markdown']);

const isMarkdownLanguage = (language?: string): boolean =>
  !!language && MARKDOWN_LANGUAGES.has(language.toLowerCase());

const markdownViewTheme = EditorView.theme({
  '&.markdown-view .cm-foldGutter': {
    display: 'none',
  },
  '&.markdown-view .cm-activeLineGutter': {
    display: 'none',
  },
});

const markdownContentClass = EditorView.contentAttributes.of({ class: 'markdown-content' });

const markdownRootClass = EditorView.editorAttributes.of({ class: 'markdown-view' });

const getEditorModeExtensions = (language?: string): Extension[] => {
  if (isMarkdownLanguage(language)) {
    return [
      markdownViewTheme,
      markdownContentClass,
      markdownRootClass,
      markdownHeadingDecorations(),
      markdownLinkDecorations(),
    ];
  }
  return [
    lineNumbers(),
    foldGutter(),
    highlightActiveLine(),
    bracketMatching(),
    closeBrackets(),
  ];
};

const createBaseExtensions = (editorViewGetter: () => EditorView | undefined): Extension[] => [
  history(),
  highlightSelectionMatches(),
  indentOnInput(),
  autocompletion(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  EditorView.lineWrapping,
  keymap.of([
    ...defaultKeymap,
    ...historyKeymap,
    ...searchKeymap,
    indentWithTab,
    {
      key: 'Escape',
      run: () => {
        editorViewGetter()?.contentDOM.blur();
        return false;
      },
    },
  ]),
];

const createUpdateListener = (onUpdate: (content: string) => void): Extension =>
  EditorView.updateListener.of((update) => {
    if (!update.docChanged) return;
    onUpdate(update.state.doc.toString());
  });

export const useCodeEditorState = (options: UseCodeEditorStateOptions) => {
  const compartments = {
    readonly: new Compartment(),
    language: new Compartment(),
    theme: new Compartment(),
    editorMode: new Compartment(),
  };

  const createState = (content: string): EditorState => {
    const readonly = options.readonly ?? false;

    return EditorState.create({
      doc: content,
      extensions: [
        ...createBaseExtensions(options.editorViewGetter),
        createUpdateListener(options.onContentUpdate),
        compartments.readonly.of(EditorState.readOnly.of(readonly)),
        compartments.language.of(getLanguageExtension(options.language)),
        compartments.theme.of(getThemeExtension(options.isDark)),
        compartments.editorMode.of(getEditorModeExtensions(options.language)),
      ],
    });
  };

  const reconfigureReadonly = (view: EditorView, value: boolean): void => {
    view.dispatch({
      effects: compartments.readonly.reconfigure(EditorState.readOnly.of(value)),
    });
  };

  const reconfigureLanguage = (view: EditorView, language?: string): void => {
    view.dispatch({
      effects: [
        compartments.language.reconfigure(getLanguageExtension(language)),
        compartments.editorMode.reconfigure(getEditorModeExtensions(language)),
      ],
    });
  };

  const reconfigureTheme = (view: EditorView, isDark?: boolean): void => {
    view.dispatch({
      effects: compartments.theme.reconfigure(getThemeExtension(isDark)),
    });
  };

  return {
    createState,
    reconfigureReadonly,
    reconfigureLanguage,
    reconfigureTheme,
  };
};
