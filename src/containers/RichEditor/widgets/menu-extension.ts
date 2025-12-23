import type { ViewUpdate } from '@codemirror/view';
import { EditorView } from '@codemirror/view';
import { getCssNumericProperty } from 'src/utils/css-utils';

const renderParentMenuContainer = (parent: HTMLElement | string): HTMLElement | undefined => {
  const activeLineElement = document.querySelector('.cm-activeLine');
  if (!activeLineElement) {
    return;
  }

  const parentElement: Element | null =
    typeof parent === 'string'
      ? document.querySelector(parent)
      : parent;

  if (!parentElement) {
    return;
  }

  const parentElementTopPadding = parseInt(
    window.getComputedStyle(parentElement).paddingTop
  ) || 0;

  const menuWidth = 30;
  const menuHeight = 24;
  const paddingTop = getCssNumericProperty(activeLineElement as HTMLElement, 'padding-top') ?? 0;
  const lineHeight = getCssNumericProperty(activeLineElement as HTMLElement, 'line-height') ?? 24;
  const centerOffset = lineHeight / 2 - menuHeight / 2;

  const relativeOffset =
    activeLineElement.getBoundingClientRect().top +
    paddingTop * 1.1 +
    centerOffset +
    parentElement.scrollTop -
    parentElementTopPadding;

  const wrapElement = document.createElement('div');
  wrapElement.className = 'cm-action-menu';
  wrapElement.style.position = 'absolute';
  wrapElement.style.top = `${relativeOffset}px`;
  wrapElement.style.zIndex = '5';
  wrapElement.style.height = `${menuWidth}px`;

  const cmEditor = document.querySelector('.cm-editor');
  cmEditor?.appendChild(wrapElement);

  return wrapElement;
};

export interface EditorMenuConfig {
  menuRenderer: (
    wrap: Element,
    editorView: EditorView
  ) => { destroy: () => void };
  parentElement: HTMLElement | string;
}

export const editorMenuExtension = (config: EditorMenuConfig) => {
  let previousLine: number;
  let wrapElement: HTMLElement | undefined;
  let menu: { destroy: () => void } | undefined;

  return EditorView.updateListener.of((v: ViewUpdate) => {
    const currentLine = v.state.doc.lineAt(v.state.selection.main.head);
    const lineChanged = currentLine.number !== previousLine;

    if (!lineChanged && !v.geometryChanged) {
      return;
    }
    previousLine = currentLine.number;

    menu?.destroy();
    wrapElement?.remove();

    wrapElement = renderParentMenuContainer(config.parentElement);
    if (!wrapElement) {
      return;
    }
    menu = config.menuRenderer(wrapElement, v.view);
  });
};
