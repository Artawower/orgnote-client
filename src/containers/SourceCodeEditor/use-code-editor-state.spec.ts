import { test, expect, beforeEach, afterEach } from 'vitest';
import { useCodeEditorState } from './use-code-editor-state';
import { EditorView } from '@codemirror/view';

let container: HTMLDivElement;
let editorView: EditorView | undefined;

const createEditorViewGetter = () => () => editorView;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  editorView?.destroy();
  editorView = undefined;
  container.remove();
});

test('createState returns valid EditorState', () => {
  const { createState } = useCodeEditorState({
    editorViewGetter: createEditorViewGetter(),
    onContentUpdate: () => {},
  });

  const state = createState('hello world');

  expect(state).toBeDefined();
  expect(state.doc.toString()).toBe('hello world');
});

test('createState with empty content', () => {
  const { createState } = useCodeEditorState({
    editorViewGetter: createEditorViewGetter(),
    onContentUpdate: () => {},
  });

  const state = createState('');

  expect(state.doc.toString()).toBe('');
});

test('createState respects readonly option', () => {
  const { createState } = useCodeEditorState({
    readonly: true,
    editorViewGetter: createEditorViewGetter(),
    onContentUpdate: () => {},
  });

  const state = createState('content');

  expect(state.readOnly).toBe(true);
});

test('createState with readonly false', () => {
  const { createState } = useCodeEditorState({
    readonly: false,
    editorViewGetter: createEditorViewGetter(),
    onContentUpdate: () => {},
  });

  const state = createState('content');

  expect(state.readOnly).toBe(false);
});

test('createState with language option', () => {
  const { createState } = useCodeEditorState({
    language: 'typescript',
    editorViewGetter: createEditorViewGetter(),
    onContentUpdate: () => {},
  });

  const state = createState('const x = 1;');

  expect(state).toBeDefined();
});

test('createState with unknown language', () => {
  const { createState } = useCodeEditorState({
    language: 'unknownlang',
    editorViewGetter: createEditorViewGetter(),
    onContentUpdate: () => {},
  });

  const state = createState('content');

  expect(state).toBeDefined();
});

test('createState with isDark option', () => {
  const { createState } = useCodeEditorState({
    isDark: true,
    editorViewGetter: createEditorViewGetter(),
    onContentUpdate: () => {},
  });

  const state = createState('content');

  expect(state).toBeDefined();
});

test('reconfigureReadonly changes readonly state', () => {
  const { createState, reconfigureReadonly } = useCodeEditorState({
    readonly: false,
    editorViewGetter: createEditorViewGetter(),
    onContentUpdate: () => {},
  });

  editorView = new EditorView({
    state: createState('content'),
    parent: container,
  });

  expect(editorView.state.readOnly).toBe(false);

  reconfigureReadonly(editorView, true);
  expect(editorView.state.readOnly).toBe(true);

  reconfigureReadonly(editorView, false);
  expect(editorView.state.readOnly).toBe(false);
});

test('reconfigureLanguage changes language', () => {
  const { createState, reconfigureLanguage } = useCodeEditorState({
    editorViewGetter: createEditorViewGetter(),
    onContentUpdate: () => {},
  });

  editorView = new EditorView({
    state: createState('content'),
    parent: container,
  });

  expect(() => reconfigureLanguage(editorView!, 'json')).not.toThrow();
  expect(() => reconfigureLanguage(editorView!, 'typescript')).not.toThrow();
  expect(() => reconfigureLanguage(editorView!, undefined)).not.toThrow();
});

test('reconfigureTheme changes theme', () => {
  const { createState, reconfigureTheme } = useCodeEditorState({
    isDark: false,
    editorViewGetter: createEditorViewGetter(),
    onContentUpdate: () => {},
  });

  editorView = new EditorView({
    state: createState('content'),
    parent: container,
  });

  expect(() => reconfigureTheme(editorView!, true)).not.toThrow();
  expect(() => reconfigureTheme(editorView!, false)).not.toThrow();
});

test('state includes line numbers extension', () => {
  const { createState } = useCodeEditorState({
    editorViewGetter: createEditorViewGetter(),
    onContentUpdate: () => {},
  });

  editorView = new EditorView({
    state: createState('line 1\nline 2'),
    parent: container,
  });

  const gutters = container.querySelector('.cm-gutters');
  expect(gutters).not.toBeNull();
});

test('state includes fold gutter extension', () => {
  const { createState } = useCodeEditorState({
    editorViewGetter: createEditorViewGetter(),
    onContentUpdate: () => {},
  });

  editorView = new EditorView({
    state: createState('function test() {\n  return 1;\n}'),
    parent: container,
  });

  const foldGutter = container.querySelector('.cm-foldGutter');
  expect(foldGutter).not.toBeNull();
});

test('supported languages mapping works', () => {
  const languages = ['ts', 'js', 'json', 'toml', 'yaml', 'html', 'css', 'py', 'rs', 'go'];

  languages.forEach((lang) => {
    const { createState } = useCodeEditorState({
      language: lang,
      editorViewGetter: createEditorViewGetter(),
      onContentUpdate: () => {},
    });

    const state = createState('content');
    expect(state).toBeDefined();
  });
});

test('language aliases work correctly', () => {
  const aliases = [
    ['typescript', 'ts'],
    ['javascript', 'js'],
    ['python', 'py'],
    ['rust', 'rs'],
  ];

  aliases.forEach(([alias]) => {
    const { createState } = useCodeEditorState({
      language: alias,
      editorViewGetter: createEditorViewGetter(),
      onContentUpdate: () => {},
    });

    const state = createState('content');
    expect(state).toBeDefined();
  });
});
