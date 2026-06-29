import type { EditorExtension } from 'orgnote-api';
import { Prec } from '@codemirror/state';
import { keymap, type EditorView } from '@codemirror/view';

const PROPERTY_DRAWER_SELECTOR = '[data-property-drawer][data-property-start][data-property-end]';
const PROPERTY_ROW_SELECTOR = '[data-property-row]';
const KEYWORD_EDITOR_SELECTOR = '[data-keyword-editor][data-keyword-start]';
const PROPERTY_FOCUS_SELECTOR = [
  '.property-row input',
  '.property-row textarea',
  '.property-row [tabindex]:not([tabindex="-1"])',
  '.property-row button',
  '.property-trigger',
  '.property-title-action',
  'button',
  'textarea',
  'input',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');
const PROPERTY_END = ':END:';
const NEWLINE = '\n';
const DEBUG_STORAGE_KEY = 'orgnote:embedded-nav-debug';

export interface PropertyDrawerRange {
  readonly from: number;
  readonly to: number;
}

interface PropertyDrawerElement {
  readonly start: number;
  readonly end: number;
  readonly element: HTMLElement;
}

interface KeywordEditorElement {
  readonly start: number;
  readonly textArea: HTMLTextAreaElement;
}

const isDebugEnabled = (): boolean =>
  typeof localStorage !== 'undefined' && localStorage.getItem(DEBUG_STORAGE_KEY) === '1';

const debugPropertyNavigation = (
  message: string,
  context: Record<string, unknown> = {},
): void => {
  if (!isDebugEnabled()) return;
  console.info(`[property-nav] ${message}`, context);
};

const describeElement = (element: Element | null): string | null => {
  if (!element) return null;
  const className = element.getAttribute('class');
  return className ? `${element.tagName.toLowerCase()}.${className}` : element.tagName.toLowerCase();
};

const parsePosition = (value: string | undefined): number | undefined => {
  const position = Number(value);
  return Number.isFinite(position) ? position : undefined;
};

const getPropertyDrawers = (view: EditorView): PropertyDrawerElement[] =>
  Array.from(view.dom.querySelectorAll<HTMLElement>(PROPERTY_DRAWER_SELECTOR))
    .map((element) => ({
      start: parsePosition(element.dataset.propertyStart),
      end: parsePosition(element.dataset.propertyEnd),
      element,
    }))
    .filter(
      (item): item is PropertyDrawerElement =>
        item.start !== undefined && item.end !== undefined,
    )
    .sort((left, right) => left.start - right.start);

const getKeywordEditors = (view: EditorView): KeywordEditorElement[] =>
  Array.from(view.dom.querySelectorAll<HTMLElement>(KEYWORD_EDITOR_SELECTOR))
    .map((element) => ({
      start: parsePosition(element.dataset.keywordStart),
      textArea: element.querySelector<HTMLTextAreaElement>('textarea'),
    }))
    .filter(
      (item): item is KeywordEditorElement =>
        item.start !== undefined && item.textArea instanceof HTMLTextAreaElement,
    )
    .sort((left, right) => left.start - right.start);

const focusKeywordTextArea = (
  textArea: HTMLTextAreaElement,
  position: 'start' | 'end',
): void => {
  requestAnimationFrame(() => {
    textArea.focus();
    const caret = position === 'start' ? 0 : textArea.value.length;
    textArea.setSelectionRange(caret, caret);
  });
};

const lineIntersectsDrawer = (
  line: { from: number; to: number },
  drawer: PropertyDrawerElement,
): boolean => drawer.start === line.from || (drawer.start <= line.from && line.from < drawer.end);

const getFocusableElements = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(PROPERTY_FOCUS_SELECTOR)).filter(
    (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
  );

const getPropertyRows = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(PROPERTY_ROW_SELECTOR));

const getBoundaryRow = (
  rows: readonly HTMLElement[],
  position: 'start' | 'end',
): HTMLElement | undefined => {
  if (position === 'start') return rows[0];
  return rows.at(-1);
};

const focusPropertyDrawer = (
  drawer: PropertyDrawerElement,
  position: 'start' | 'end',
): void => {
  const rows = getPropertyRows(drawer.element);
  const elements = getFocusableElements(drawer.element);
  const target = getBoundaryRow(rows, position) ?? drawer.element;

  debugPropertyNavigation('focus property drawer', {
    drawer: { start: drawer.start, end: drawer.end },
    position,
    root: describeElement(drawer.element),
    target: describeElement(target),
    rows: rows.map(describeElement),
    focusable: elements.map(describeElement),
  });

  requestAnimationFrame(() => {
    target.focus();
  });
};

const focusPropertyDrawerAtLine = (
  view: EditorView,
  lineNumber: number,
  position: 'start' | 'end',
): boolean => {
  if (lineNumber < 1 || lineNumber > view.state.doc.lines) return false;

  const line = view.state.doc.line(lineNumber);
  const drawers = getPropertyDrawers(view);
  const target = drawers.find((drawer) => lineIntersectsDrawer(line, drawer));

  debugPropertyNavigation('focus property at line', {
    lineNumber,
    lineFrom: line.from,
    lineTo: line.to,
    position,
    drawers: drawers.map(({ start, end }) => ({ start, end })),
    target: target ? { start: target.start, end: target.end } : null,
  });

  if (!target) return false;
  focusPropertyDrawer(target, position);
  return true;
};

const isNewlineBeforeCursor = (view: EditorView): boolean => {
  const head = view.state.selection.main.head;
  if (head === 0) return false;
  return view.state.doc.sliceString(head - 1, head) === NEWLINE;
};

const focusPropertyBelow = (view: EditorView): boolean => {
  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);

  debugPropertyNavigation('arrow down from CodeMirror', {
    head,
    lineNumber: line.number,
    lineFrom: line.from,
    lineTo: line.to,
  });

  if (head < line.to && focusPropertyDrawerAtLine(view, line.number, 'start')) return true;
  return focusPropertyDrawerAtLine(view, line.number + 1, 'start');
};

const focusPropertyAbove = (view: EditorView): boolean => {
  const head = view.state.selection.main.head;
  const line = view.state.doc.lineAt(head);
  const hasNewlineBefore = isNewlineBeforeCursor(view);

  debugPropertyNavigation('arrow up from CodeMirror', {
    head,
    lineNumber: line.number,
    lineFrom: line.from,
    lineTo: line.to,
    hasNewlineBefore,
  });

  if (head > line.from && focusPropertyDrawerAtLine(view, line.number, 'end')) return true;

  if (hasNewlineBefore) {
    const previousLine = view.state.doc.lineAt(head - 1);
    if (focusPropertyDrawerAtLine(view, previousLine.number, 'end')) return true;
  }

  return focusPropertyDrawerAtLine(view, line.number - 1, 'end');
};

const isBlankLine = (view: EditorView, lineNumber: number): boolean => {
  const line = view.state.doc.line(lineNumber);
  return view.state.doc.sliceString(line.from, line.to).trim() === '';
};

const findCurrentDrawerEnd = (
  view: EditorView,
  range: PropertyDrawerRange,
): number => {
  for (let lineNumber = view.state.doc.lineAt(range.from).number; lineNumber <= view.state.doc.lines; lineNumber += 1) {
    const line = view.state.doc.line(lineNumber);
    if (view.state.doc.sliceString(line.from, line.to).trim() === PROPERTY_END) return line.to;
  }

  return range.to;
};

const resolveCurrentDrawerRange = (
  view: EditorView,
  range: PropertyDrawerRange,
): PropertyDrawerRange => ({
  from: range.from,
  to: findCurrentDrawerEnd(view, range),
});

const getBoundaryLineNumber = (
  view: EditorView,
  range: PropertyDrawerRange,
  step: -1 | 1,
): number => {
  const position = step < 0 ? range.from : range.to;
  return view.state.doc.lineAt(position).number + step;
};

const findAdjacentMeaningfulLine = (
  view: EditorView,
  range: PropertyDrawerRange,
  step: -1 | 1,
): number | undefined => {
  for (
    let lineNumber = getBoundaryLineNumber(view, range, step);
    lineNumber >= 1 && lineNumber <= view.state.doc.lines;
    lineNumber += step
  ) {
    if (!isBlankLine(view, lineNumber)) return lineNumber;
  }

  return undefined;
};

const focusKeywordAroundDrawer = (
  view: EditorView,
  range: PropertyDrawerRange,
  step: -1 | 1,
): boolean => {
  const targetLineNumber = findAdjacentMeaningfulLine(view, range, step);
  if (targetLineNumber === undefined) return false;

  const line = view.state.doc.line(targetLineNumber);
  const target = getKeywordEditors(view).find((editor) => editor.start === line.from);
  const position = step < 0 ? 'end' : 'start';

  debugPropertyNavigation('focus keyword around property drawer', {
    range,
    step,
    targetLine: targetLineNumber,
    targetLineFrom: line.from,
    target: target ? { start: target.start } : null,
  });

  if (!target) return false;
  focusKeywordTextArea(target.textArea, position);
  return true;
};

const getEditorAnchorAroundDrawer = (
  view: EditorView,
  range: PropertyDrawerRange,
  step: -1 | 1,
): number => {
  const targetLineNumber = findAdjacentMeaningfulLine(view, range, step);
  if (targetLineNumber === undefined) return step < 0 ? range.from : range.to;

  const line = view.state.doc.line(targetLineNumber);
  return step < 0 ? line.to : line.from;
};

const appendLineAfterDrawer = (
  view: EditorView,
  range: PropertyDrawerRange,
): void => {
  const changes = view.state.changes({ from: range.to, to: range.to, insert: NEWLINE });
  const anchor = changes.mapPos(range.to, 1);

  debugPropertyNavigation('append line after property drawer', {
    range,
    anchor,
  });

  view.dispatch({ changes, selection: { anchor }, scrollIntoView: true });
  view.focus();
};

export const focusOutsidePropertyDrawer = (
  view: EditorView,
  range: PropertyDrawerRange,
  step: -1 | 1,
): void => {
  const currentRange = resolveCurrentDrawerRange(view, range);

  if (focusKeywordAroundDrawer(view, currentRange, step)) return;

  if (step > 0 && currentRange.to >= view.state.doc.length) {
    appendLineAfterDrawer(view, currentRange);
    return;
  }

  const anchor = getEditorAnchorAroundDrawer(view, currentRange, step);

  debugPropertyNavigation('focus CodeMirror around property drawer', {
    range,
    currentRange,
    step,
    anchor,
  });

  view.dispatch({ selection: { anchor }, scrollIntoView: true });
  view.focus();
};

const getActiveRowIndex = (rows: readonly HTMLElement[]): number => {
  const active = document.activeElement;
  return rows.findIndex((row) => row === active || row.contains(active));
};

export const handlePropertyDrawerArrowKey = (
  event: KeyboardEvent,
  view: EditorView,
  range: PropertyDrawerRange,
): void => {
  if (!(event.currentTarget instanceof HTMLElement)) return;
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

  const rows = getPropertyRows(event.currentTarget);
  const activeIndex = getActiveRowIndex(rows);
  const step = event.key === 'ArrowDown' ? 1 : -1;
  const target = rows[activeIndex + step];

  debugPropertyNavigation('arrow from property drawer', {
    key: event.key,
    range,
    root: describeElement(event.currentTarget),
    active: describeElement(document.activeElement),
    rows: rows.map(describeElement),
    activeIndex,
    target: describeElement(target ?? null),
  });

  if (activeIndex === -1) return;

  event.preventDefault();

  if (target) {
    debugPropertyNavigation('focus next property row', {
      index: activeIndex + step,
      target: describeElement(target),
    });
    target.focus();
    return;
  }

  focusOutsidePropertyDrawer(view, range, step);
};

const findAdjacentPropertyLine = (
  view: EditorView,
  currentStart: number,
  step: -1 | 1,
): number | undefined => {
  const currentLine = view.state.doc.lineAt(currentStart);
  const drawers = getPropertyDrawers(view);

  for (
    let lineNumber = currentLine.number + step;
    lineNumber >= 1 && lineNumber <= view.state.doc.lines;
    lineNumber += step
  ) {
    const line = view.state.doc.line(lineNumber);
    if (drawers.some((drawer) => lineIntersectsDrawer(line, drawer))) return lineNumber;
    if (!isBlankLine(view, lineNumber)) return undefined;
  }

  return undefined;
};

export const hasAdjacentPropertyDrawer = (
  view: EditorView,
  currentStart: number,
  step: -1 | 1,
): boolean => {
  const currentLine = view.state.doc.lineAt(currentStart);
  const targetLineNumber = findAdjacentPropertyLine(view, currentStart, step);
  const result = targetLineNumber !== undefined;
  debugPropertyNavigation('has adjacent property drawer', {
    currentStart,
    step,
    currentLine: currentLine.number,
    targetLine: targetLineNumber,
    result,
  });
  return result;
};

export const focusAdjacentPropertyDrawer = (
  view: EditorView,
  currentStart: number,
  step: -1 | 1,
  position: 'start' | 'end',
): boolean => {
  const currentLine = view.state.doc.lineAt(currentStart);
  const targetLineNumber = findAdjacentPropertyLine(view, currentStart, step);
  debugPropertyNavigation('focus adjacent property drawer', {
    currentStart,
    step,
    currentLine: currentLine.number,
    targetLine: targetLineNumber,
    position,
  });
  if (targetLineNumber === undefined) return false;
  return focusPropertyDrawerAtLine(view, targetLineNumber, position);
};

const isCollapsedSelection = (view: EditorView): boolean => view.state.selection.main.empty;

export const propertyNavigationExtension: EditorExtension = () =>
  Prec.highest(
    keymap.of([
      {
        key: 'ArrowDown',
        run: (view) => isCollapsedSelection(view) && focusPropertyBelow(view),
      },
      {
        key: 'ArrowUp',
        run: (view) => isCollapsedSelection(view) && focusPropertyAbove(view),
      },
    ]),
  );
