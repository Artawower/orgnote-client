import { CommonEmbeddedWidget } from './widget.model';
import { EditorView, WidgetType } from '@codemirror/view';
import { OrgNode, walkTree } from 'org-mode-ast';

export class BaseOrgWidget extends WidgetType {
  constructor(
    protected readonly view: EditorView,
    protected readonly rootNodeSrc: () => OrgNode,
    protected readonly orgNode: OrgNode,
    protected readonly embeddedWidget: CommonEmbeddedWidget
  ) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public toDOM(_view: EditorView): HTMLElement {
    throw new Error('Method not implemented.');
  }

  protected updateValue(newVal: string): void {
    const updateSchema = this.embeddedWidget.viewUpdater?.(
      this.getActualNode(this.orgNode),
      newVal
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
    let actualNode: OrgNode;
    walkTree(rootNode, (n: OrgNode) => {
      if (
        n.start === oldOrgNode.start &&
        n.end === oldOrgNode.end &&
        n.is(oldOrgNode.type)
      ) {
        actualNode = n;
        return true;
      }
    });
    return actualNode ?? oldOrgNode;
  }
}
