import { EditorView, ViewUpdate } from '@codemirror/view';
import { getCssNumericProperty, mockServer } from 'src/tools';

const renderParentMenuContainer = (parent: HTMLElement | string) => {
  const activeLineElement = document.querySelector('.cm-activeLine');
  if (!activeLineElement) {
    return;
  }

  const parentElement: Element =
    typeof parent === 'string'
      ? document.querySelector(parent as string)
      : (parent as Element);

  if (!parentElement) {
    return;
  }

  const parentElementTopPadding = mockServer(
    () => parseInt(window.getComputedStyle(parentElement).paddingTop),
    0
  )();

  const menuWidth = 30;
  const menuHeight = 24;
  const paddingTop = getCssNumericProperty(activeLineElement, 'padding-top');
  const lineHeight = getCssNumericProperty(activeLineElement, 'line-height');
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
  wrapElement.style.height = `${menuWidth}`;

  const cmEditor = document.querySelector('.cm-editor');

  cmEditor.appendChild(wrapElement);

  return wrapElement;
};

export const editorMenuExtension = (config: {
  menuRenderer: (
    wrap: Element,
    editorView: EditorView
  ) => { destroy: () => void };
  parentElement: HTMLElement | string;
}) => {
  let previousLine: number;
  let wrapElement: HTMLElement;
  let menu: { destroy: () => void };

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
