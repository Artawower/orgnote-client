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
    const updateSchema = this.embeddedWidget.viewUpdater?.(this.orgNode, newVal);

    this.view.dispatch({
      changes: updateSchema ?? {
        from: this.orgNode.start,
        to: this.orgNode.end,
        insert: newVal,
      },
    });
  }

  public override ignoreEvent(event: Event): boolean {
    if (this.embeddedWidget.ignoreEvent) {
      event.stopPropagation();
      event.preventDefault();
    }
    return !!this.embeddedWidget.ignoreEvent;
  }
}
