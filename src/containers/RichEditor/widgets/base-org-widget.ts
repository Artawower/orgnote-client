import type { CommonEmbeddedWidget } from 'orgnote-api';
import type { EditorView } from '@codemirror/view';
import { WidgetType } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';
import { walkTree } from 'org-mode-ast';

export class BaseOrgWidget extends WidgetType {
  constructor(
    protected readonly view: EditorView,
    protected readonly rootNodeSrc: () => OrgNode | null,
    protected readonly orgNode: OrgNode,
    protected readonly embeddedWidget: CommonEmbeddedWidget,
  ) {
    super();
  }

  public toDOM(): HTMLElement {
    throw new Error('Method not implemented.');
  }

  protected updateValue(newVal: string): void {
    const updateSchema = this.embeddedWidget.viewUpdater?.(
      this.getActualNode(this.orgNode),
      newVal,
    );
    this.view.dispatch({
      changes: updateSchema ?? {
        from: this.orgNode.start,
        to: this.orgNode.end,
        insert: newVal,
      },
    });
  }

  protected getActualNode(oldOrgNode: OrgNode): OrgNode {
    const rootNode = this.rootNodeSrc();
    if (!rootNode) return oldOrgNode;

    let actualNode: OrgNode | undefined;
    walkTree(rootNode, (n: OrgNode): boolean => {
      if (n.start === oldOrgNode.start && n.end === oldOrgNode.end && n.is(oldOrgNode.type)) {
        actualNode = n;
        return true;
      }
      return false;
    });
    return actualNode ?? oldOrgNode;
  }

  public override ignoreEvent(event: Event): boolean {
    if (this.embeddedWidget.ignoreEvent) {
      event.stopPropagation();
      event.preventDefault();
    }
    return !!this.embeddedWidget.ignoreEvent;
  }
}
