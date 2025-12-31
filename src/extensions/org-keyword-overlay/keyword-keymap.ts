import type { EditorExtension, EditorExtensionParams } from 'orgnote-api';
import { Annotation, Prec } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { keymap, EditorView as EV } from '@codemirror/view';
import { NodeType, type OrgNode } from 'org-mode-ast';
import { isPresent } from 'orgnote-api/utils';
import { getKeywordName, getKeywordValue, isSupportedKeyword, KEYWORD_PATTERNS } from './utils';

const cursorFixAnnotation = Annotation.define<boolean>();

const CHAR_LENGTH = 1;
const COLON_SPACE_LENGTH = 2;

const isReadOnly = (view: EditorView): boolean =>
  view.state.facet(EV.editable) === false;

const hasSelection = (view: EditorView): boolean =>
  !view.state.selection.main.empty;

const findKeywordAtLine = (rootNode: OrgNode | null, lineStart: number): OrgNode | null => {
  if (!rootNode?.children) return null;

  for (const child of rootNode.children) {
    if (!child.is(NodeType.Keyword)) continue;
    if (child.start !== lineStart) continue;

    const keywordName = getKeywordName(child);
    if (!isSupportedKeyword(keywordName)) continue;

    return child;
  }

  return null;
};

const findKeywordAtPosition = (
  rootNode: OrgNode | null,
  pos: number,
  view: EditorView,
): OrgNode | null => {
  const line = view.state.doc.lineAt(pos);
  if (!line.text.startsWith('#+')) return null;

  return findKeywordAtLine(rootNode, line.from);
};

const getLineRange = (view: EditorView, pos: number): { from: number; to: number } => {
  const line = view.state.doc.lineAt(pos);
  return { from: line.from, to: line.to };
};

const handleBackspace = (view: EditorView, getOrgNode: () => OrgNode | null): boolean => {
  if (isReadOnly(view)) return false;
  if (hasSelection(view)) return false;

  const pos = view.state.selection.main.head;
  const keywordNode = findKeywordAtPosition(getOrgNode(), pos, view);

  if (!keywordNode) return false;

  const value = getKeywordValue(keywordNode);
  if (value.trim() !== '') return false;

  const { from, to } = getLineRange(view, pos);
  const nextLineStart = to + CHAR_LENGTH;
  const deleteEnd = nextLineStart <= view.state.doc.length ? nextLineStart : to;

  view.dispatch({
    changes: { from, to: deleteEnd, insert: '' },
  });

  return true;
};

const getKeywordPrefixEnd = (keywordNode: OrgNode): number => {
  const firstChild = keywordNode.children?.first;
  if (!firstChild?.value) return keywordNode.start;

  const colonIndex = firstChild.value.indexOf(':');
  if (colonIndex === -1) return firstChild.end ?? keywordNode.start;

  const prefixEnd = keywordNode.start + colonIndex + CHAR_LENGTH;

  const charAfterColon = firstChild.value[colonIndex + CHAR_LENGTH];
  if (charAfterColon === ' ') {
    return prefixEnd + CHAR_LENGTH;
  }

  return prefixEnd;
};

const moveCursorToPrefixEnd = (view: EditorView, keywordNode: OrgNode): void => {
  const prefixEnd = getKeywordPrefixEnd(keywordNode);
  view.dispatch({ selection: { anchor: prefixEnd } });
};

const handleArrowLeft = (view: EditorView, getOrgNode: () => OrgNode | null): boolean => {
  if (hasSelection(view)) return false;

  const pos = view.state.selection.main.head;
  const keywordNode = findKeywordAtPosition(getOrgNode(), pos, view);

  if (!keywordNode) return false;

  const prefixEnd = getKeywordPrefixEnd(keywordNode);

  if (pos <= prefixEnd) {
    const { from } = getLineRange(view, pos);
    const newPos = from > 0 ? from - CHAR_LENGTH : 0;
    view.dispatch({ selection: { anchor: newPos } });
    return true;
  }

  return false;
};

const handleArrowRight = (view: EditorView, getOrgNode: () => OrgNode | null): boolean => {
  if (hasSelection(view)) return false;

  const pos = view.state.selection.main.head;
  const line = view.state.doc.lineAt(pos);

  if (pos !== line.from) return false;

  const keywordNode = findKeywordAtPosition(getOrgNode(), line.from, view);
  if (!keywordNode) return false;

  moveCursorToPrefixEnd(view, keywordNode);
  return true;
};

type VerticalDirection = 'up' | 'down';

const handleVerticalArrow = (
  view: EditorView,
  getOrgNode: () => OrgNode | null,
  direction: VerticalDirection,
): boolean => {
  if (hasSelection(view)) return false;

  const pos = view.state.selection.main.head;
  const line = view.state.doc.lineAt(pos);

  const isUp = direction === 'up';
  const canMove = isUp ? line.number > 1 : line.number < view.state.doc.lines;
  if (!canMove) return false;

  const targetLine = view.state.doc.line(line.number + (isUp ? -1 : 1));
  const keywordNode = findKeywordAtPosition(getOrgNode(), targetLine.from, view);

  if (!keywordNode) return false;

  moveCursorToPrefixEnd(view, keywordNode);
  return true;
};

const handleHome = (view: EditorView, getOrgNode: () => OrgNode | null): boolean => {
  const pos = view.state.selection.main.head;
  const keywordNode = findKeywordAtPosition(getOrgNode(), pos, view);

  if (!keywordNode) return false;

  moveCursorToPrefixEnd(view, keywordNode);
  return true;
};

const handleEnd = (view: EditorView, getOrgNode: () => OrgNode | null): boolean => {
  const pos = view.state.selection.main.head;
  const keywordNode = findKeywordAtPosition(getOrgNode(), pos, view);

  if (!keywordNode) return false;

  view.dispatch({ selection: { anchor: keywordNode.end } });
  return true;
};

const handleArrowDown = (view: EditorView, getOrgNode: () => OrgNode | null): boolean =>
  handleVerticalArrow(view, getOrgNode, 'down');

const handleArrowUp = (view: EditorView, getOrgNode: () => OrgNode | null): boolean =>
  handleVerticalArrow(view, getOrgNode, 'up');

const createInputHandler = () =>
  EV.inputHandler.of((view, from, to, text) => {
    if (text !== ':') return false;
    if (isReadOnly(view)) return false;

    const line = view.state.doc.lineAt(from);
    const lineText = line.text.toLowerCase();

    for (const pattern of KEYWORD_PATTERNS) {
      if (lineText === pattern) {
        view.dispatch({
          changes: { from, to, insert: ': ' },
          selection: { anchor: from + COLON_SPACE_LENGTH },
        });
        return true;
      }
    }

    return false;
  });

const needsSpaceAfterColon = (keywordNode: OrgNode): number | null => {
  const firstChild = keywordNode.children?.first;
  if (!firstChild?.value) return null;

  const colonIndex = firstChild.value.indexOf(':');
  if (colonIndex === -1) return null;

  const charAfterColon = firstChild.value[colonIndex + CHAR_LENGTH];
  if (charAfterColon && charAfterColon !== ' ') {
    return keywordNode.start + colonIndex + CHAR_LENGTH;
  }

  return null;
};

const createAutoSpaceExtension = (getOrgNode: () => OrgNode | null) =>
  EV.updateListener.of((update) => {
    if (!update.docChanged) return;

    const rootNode = getOrgNode();
    if (!rootNode?.children) return;

    const changes: { from: number; insert: string }[] = [];

    for (const child of rootNode.children) {
      if (!child.is(NodeType.Keyword)) continue;

      const keywordName = getKeywordName(child);
      if (!isSupportedKeyword(keywordName)) continue;

      const insertPos = needsSpaceAfterColon(child);
      if (isPresent(insertPos)) {
        changes.push({ from: insertPos, insert: ' ' });
      }
    }

    if (changes.length > 0) {
      queueMicrotask(() => {
        update.view.dispatch({ changes });
      });
    }
  });

const createCursorFixExtension = (getOrgNode: () => OrgNode | null) =>
  EV.updateListener.of((update) => {
    if (!update.selectionSet) return;

    const isCursorFix = update.transactions.some((tr) => tr.annotation(cursorFixAnnotation));
    if (isCursorFix) return;

    const pos = update.state.selection.main.head;
    const line = update.view.state.doc.lineAt(pos);

    if (!line.text.startsWith('#+')) return;

    const keywordNode = findKeywordAtLine(getOrgNode(), line.from);
    if (!keywordNode) return;

    const prefixEnd = getKeywordPrefixEnd(keywordNode);

    if (pos < prefixEnd) {
      update.view.dispatch({
        selection: { anchor: prefixEnd },
        annotations: cursorFixAnnotation.of(true),
      });
    }
  });

export const keywordKeymapExtension: EditorExtension = (params: EditorExtensionParams) => [
  Prec.high(
    keymap.of([
      {
        key: 'Backspace',
        run: (view) => handleBackspace(view, params.orgNodeGetter),
      },
      {
        key: 'ArrowLeft',
        run: (view) => handleArrowLeft(view, params.orgNodeGetter),
      },
      {
        key: 'ArrowRight',
        run: (view) => handleArrowRight(view, params.orgNodeGetter),
      },
      {
        key: 'ArrowDown',
        run: (view) => handleArrowDown(view, params.orgNodeGetter),
      },
      {
        key: 'ArrowUp',
        run: (view) => handleArrowUp(view, params.orgNodeGetter),
      },
      {
        key: 'Home',
        run: (view) => handleHome(view, params.orgNodeGetter),
      },
      {
        key: 'End',
        run: (view) => handleEnd(view, params.orgNodeGetter),
      },
    ]),
  ),
  createInputHandler(),
  createAutoSpaceExtension(params.orgNodeGetter),
  createCursorFixExtension(params.orgNodeGetter),
];
