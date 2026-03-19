import type { CommonEmbeddedWidget } from 'orgnote-api';
import type { EditorView } from '@codemirror/view';
import { WidgetType } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';

export class BaseOrgWidget extends WidgetType {
  constructor(
    protected readonly view: EditorView,
    protected readonly rootNodeSrc: () => OrgNode | null,
    protected _orgNode: OrgNode,
    protected readonly embeddedWidget: CommonEmbeddedWidget,
  ) {
    super();
  }

  public get orgNode(): OrgNode {
    return this._orgNode;
  }

  public updateOrgNode(orgNode: OrgNode): void {
    this._orgNode = orgNode;
  }

  public toDOM(): HTMLElement {
    throw new Error('Method not implemented.');
  }

  protected updateValue(newVal: string): void {
    const cursorPosition = this.view.state.selection.main.head;
    const changes = this.embeddedWidget.viewUpdater?.(this.orgNode, newVal) ?? {
      from: this.orgNode.start,
      to: this.orgNode.end,
      insert: newVal,
    };

    const mappedCursor = this.view.state.changes(changes).mapPos(cursorPosition);

    this.view.dispatch({
      changes,
      selection: { anchor: mappedCursor },
    });

    this.view.focus();
  }

  public override ignoreEvent(): boolean {
    return !!this.embeddedWidget.ignoreEvent;
  }
}
