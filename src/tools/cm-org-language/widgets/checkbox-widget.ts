import { Range } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { OrgNode } from 'org-mode-ast';

export class CheckboxWidget extends WidgetType {
  constructor(readonly checked: boolean) {
    super();
  }

  public static init(view: EditorView, orgNode: OrgNode): Range<Decoration> {
    return Decoration.replace({
      widget: new CheckboxWidget(orgNode.checked),
      side: -1,
    }).range(orgNode.start, orgNode.end);
  }

  static handleClick(target: HTMLElement, view: EditorView): boolean {
    if (
      target.nodeName == 'INPUT' &&
      target.parentElement.classList.contains('cm-boolean-toggle')
    ) {
      return CheckboxWidget.toggleBoolean(view, view.posAtDOM(target));
    }
  }

  static toggleBoolean(view: EditorView, pos: number): boolean {
    const before = view.state.doc.sliceString(pos - 3, pos);
    let change;

    if (before == '[ ]') change = { from: pos - 3, to: pos, insert: '[x]' };
    else if (before.toLowerCase() === '[x]')
      change = { from: pos - 3, to: pos, insert: '[ ]' };
    else return false;
    view.dispatch({ changes: change });
    return true;
  }

  public eq(other: CheckboxWidget) {
    return other.checked == this.checked;
  }

  toDOM() {
    const wrap = document.createElement('span');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.className = 'cm-boolean-toggle';
    const box = wrap.appendChild(document.createElement('input'));
    box.type = 'checkbox';
    box.checked = this.checked;
    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}
