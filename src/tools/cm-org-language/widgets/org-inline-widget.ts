import { EmbeddedOrgWidget, InlineEmbeddedWidget } from './widget.model';
import { Range } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { OrgNode, walkTree } from 'org-mode-ast';

export class OrgInlineWidget extends WidgetType {
  private widget: EmbeddedOrgWidget;
  constructor(
    private readonly view: EditorView,
    private readonly orgNode: OrgNode,
    private readonly inlineWidget: InlineEmbeddedWidget,
    private readonly rootNodeSrc: () => OrgNode
  ) {
    super();
  }

  public static init(
    view: EditorView,
    orgNode: OrgNode,
    inlineWidget: InlineEmbeddedWidget,
    rootNodeSrc: () => OrgNode
  ): Range<Decoration> {
    // TODO: master TMP hack.
    const realText = view.state.doc
      .toString()
      .slice(orgNode.start, orgNode.end);
    if (realText !== orgNode.rawValue) {
      // TODO: master it's a really dirty hack.
      // The problem is that we have an unperiodic bug with
      // incorrect position when editing at the end of line.
      // In this case we have incorrect range. Investigate it!
      return;
    }
    const [startOffset, endOffset] = inlineWidget.showRangeOffset ?? [0, 0];
    return Decoration[inlineWidget.decorationType]({
      widget: new OrgInlineWidget(view, orgNode, inlineWidget, rootNodeSrc),
      side: inlineWidget.side,
      class: inlineWidget.classBuilder?.(orgNode),
      inclusive: inlineWidget.inclusive,
    }).range(orgNode.start + startOffset, orgNode.end + endOffset);
  }

  public eq(other: WidgetType) {
    return (
      (other as unknown as OrgInlineWidget).orgNode.rawValue ==
      this.orgNode.rawValue
    );
  }

  toDOM() {
    const wrap = document.createElement(
      this.inlineWidget.wrapComponent ?? 'span'
    );
    this.widget = this.inlineWidget.widgetBuilder({
      wrap,
      orgNode: this.orgNode,
      // TODO: master I don't like this implementation.
      // But i need to get actual node position inside nested widgets
      // Speculate about it.
      rootNodeSrc: this.rootNodeSrc,
      onUpdateFn: this.updateValue.bind(this),
      editorView: this.view,
    });
    return wrap;
  }

  private getActualNode(oldOrgNode: OrgNode): OrgNode {
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

  private updateValue(newVal: string): void {
    const updateSchema = this.inlineWidget.viewUpdater?.(
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

  public ignoreEvent(): boolean {
    return this.inlineWidget.ignoreEvent;
  }

  destroy(): void {
    this.widget.destroy();
  }
}
