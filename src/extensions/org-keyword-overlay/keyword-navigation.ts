import type { EditorExtension } from 'orgnote-api';
import { Prec } from '@codemirror/state';
import { keymap, type EditorView } from '@codemirror/view';

type FocusPosition = 'start' | 'end';

interface KeywordEditorElement {
  readonly start: number;
  readonly textArea: HTMLTextAreaElement;
}

const KEYWORD_EDITOR_SELECTOR = '[data-keyword-editor][data-keyword-start]';
const NEWLINE = '\n';
const DEBUG_STORAGE_KEY = 'orgnote:embedded-nav-debug';

const isDebugEnabled = (): boolean =>
  typeof localStorage !== 'undefined' && localStorage.getItem(DEBUG_STORAGE_KEY) === '1';

export const debugEmbeddedNavigation = (
  message: string,
  context: Record<string, unknown> = {},
): void => {
  if (!isDebugEnabled()) return;
  console.info(`[embedded-nav] ${message}`, context);
};

const getKeywordEditors = (view: EditorView): KeywordEditorElement[] =>
  Array.from(view.dom.querySelectorAll<HTMLElement>(KEYWORD_EDITOR_SELECTOR))
    .map((element) => ({
      start: Number(element.dataset.keywordStart),
      textArea: element.querySelector<HTMLTextAreaElement>('textarea'),
    }))
    .filter(
      (item): item is KeywordEditorElement =>
        Number.isFinite(item.start) && item.textArea instanceof HTMLTextAreaElement,
    )
    .sort((left, right) => left.start - right.start);

const focusTextArea = (textArea: HTMLTextAreaElement, position: FocusPosition): void => {
  requestAnimationFrame(() => {
    textArea.focus();
    const caret = position === 'start' ? 0 : textArea.value.length;
    textArea.setSelectionRange(caret, caret);
  });
};

const findWidgetAtLineStart = (view: EditorView, lineStart: number): KeywordEditorElement | undefined =>
  getKeywordEditors(view).find((editor) => editor.start === lineStart);

const focusKeywordAtLine = (
  view: EditorView,
  lineNumber: number,
  position: FocusPosition,
): boolean => {
  if (lineNumber < 1 || lineNumber > view.state.doc.lines) return false;

  const targetLine = view.state.doc.line(lineNumber);
  const target = findWidgetAtLineStart(view, targetLine.from);

  debugEmbeddedNavigation('focus keyword at line', {
    lineNumber,
    lineFrom: targetLine.from,
    lineTo: targetLine.to,
    position,
    target: target ? { start: target.start } : null,
    editors: getKeywordEditors(view).map((editor) => ({ start: editor.start })),
  });

  if (!target) return false;

  focusTextArea(target.textArea, position);
  return true;
};

const isNewlineBeforeCursor = (view: EditorView): boolean => {
  const head = view.state.selection.main.head;
  if (head === 0) return false;
  return view.state.doc.sliceString(head - 1, head) === NEWLINE;
};

const focusKeywordBelow = (view: EditorView): boolean => {
  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);

  debugEmbeddedNavigation('arrow down from CodeMirror', {
    head,
    lineNumber: line.number,
    lineFrom: line.from,
    lineTo: line.to,
  });

  if (head < line.to && focusKeywordAtLine(view, line.number, 'start')) return true;

  return focusKeywordAtLine(view, line.number + 1, 'start');
};

const focusKeywordAbove = (view: EditorView): boolean => {
  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);
  const hasNewlineBefore = isNewlineBeforeCursor(view);

  debugEmbeddedNavigation('arrow up from CodeMirror', {
    head,
    lineNumber: line.number,
    lineFrom: line.from,
    lineTo: line.to,
    hasNewlineBefore,
  });

  if (head > line.from && focusKeywordAtLine(view, line.number, 'end')) return true;

  if (hasNewlineBefore) {
    const previousLine = view.state.doc.lineAt(head - 1);
    if (focusKeywordAtLine(view, previousLine.number, 'end')) return true;
  }

  return focusKeywordAtLine(view, line.number - 1, 'end');
};

export const hasAdjacentEmbeddedEditor = (
  view: EditorView,
  currentStart: number,
  step: -1 | 1,
): boolean => {
  const currentLine = view.state.doc.lineAt(currentStart);
  const targetLineNumber = currentLine.number + step;
  if (targetLineNumber < 1 || targetLineNumber > view.state.doc.lines) return false;

  const targetLine = view.state.doc.line(targetLineNumber);
  const result = getKeywordEditors(view).some((editor) => editor.start === targetLine.from);

  debugEmbeddedNavigation('has adjacent keyword editor', {
    currentStart,
    step,
    currentLine: currentLine.number,
    targetLine: targetLineNumber,
    targetLineFrom: targetLine.from,
    result,
  });

  return result;
};

export const focusAdjacentEmbeddedEditor = (
  view: EditorView,
  currentStart: number,
  step: -1 | 1,
  position: FocusPosition,
): boolean => {
  const currentLine = view.state.doc.lineAt(currentStart);
  const targetLine = currentLine.number + step;

  debugEmbeddedNavigation('focus adjacent keyword editor', {
    currentStart,
    step,
    currentLine: currentLine.number,
    targetLine,
    position,
  });

  return focusKeywordAtLine(view, targetLine, position);
};

const isCollapsedSelection = (view: EditorView): boolean => view.state.selection.main.empty;

export const keywordNavigationExtension: EditorExtension = () =>
  Prec.high(
    keymap.of([
      {
        key: 'ArrowDown',
        run: (view) => isCollapsedSelection(view) && focusKeywordBelow(view),
      },
      {
        key: 'ArrowUp',
        run: (view) => isCollapsedSelection(view) && focusKeywordAbove(view),
      },
    ]),
  );
