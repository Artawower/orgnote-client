import { Range } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { OrgNode } from 'org-mode-ast';

export class TodoKeywordWidget extends WidgetType {
  constructor(private readonly keyword: string) {
    super();
  }

  public static init(view: EditorView, orgNode: OrgNode): Range<Decoration> {
    return Decoration.mark({
      widget: new TodoKeywordWidget(orgNode.value),
      class: `org-keyword-${orgNode.value.toLowerCase()}`,
      side: 1,
      inclusive: false,
    }).range(orgNode.start, orgNode.end);
  }

  static handleClick(): boolean {
    return;
  }

  public eq(other: TodoKeywordWidget) {
    return other.keyword === this.keyword;
  }

  toDOM() {
    const wrap = document.createElement('span');
    return wrap;
  }

  ignoreEvent() {
    return false;
  }
}
