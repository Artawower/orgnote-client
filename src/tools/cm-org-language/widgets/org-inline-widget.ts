import { BaseOrgWidget } from './base-org-widget';
import { EmbeddedOrgWidget, InlineEmbeddedWidget } from './widget.model';
import { Range } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { OrgNode } from 'org-mode-ast';

export class OrgInlineWidget extends BaseOrgWidget {
  private widget: EmbeddedOrgWidget;
  constructor(
    view: EditorView,
    orgNode: OrgNode,
    private readonly inlineWidget: InlineEmbeddedWidget,
    rootNodeSrc: () => OrgNode,
    private readonly readonly: boolean
  ) {
    super(view, rootNodeSrc, orgNode, inlineWidget);
  }

  public static init(
    view: EditorView,
    orgNode: OrgNode,
    inlineWidget: InlineEmbeddedWidget,
    rootNodeSrc: () => OrgNode,
    redaonly: boolean
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
      widget: new OrgInlineWidget(
        view,
        orgNode,
        inlineWidget,
        rootNodeSrc,
        redaonly
      ),
      side: inlineWidget.side,
      class: inlineWidget.classBuilder?.(orgNode),
      inclusive: inlineWidget.inclusive,
    }).range(orgNode.start + startOffset, orgNode.end + endOffset);
  }

  public eq(other: WidgetType) {
    const otherNode = (other as unknown as OrgInlineWidget).orgNode;
    return (
      otherNode.rawValue == this.orgNode.rawValue &&
      otherNode.parent.type === this.orgNode.parent.type &&
      otherNode.children?.length === this.orgNode.children?.length
    );
  }

  toDOM() {
    const wrap = document.createElement(
      this.inlineWidget.wrapComponent ?? 'span'
    );
    this.widget = this.embeddedWidget.widgetBuilder({
      wrap,
      orgNode: this.orgNode,
      // TODO: master I don't like this implementation.
      // But i need to get actual node position inside nested widgets
      // Speculate about it.
      rootNodeSrc: this.rootNodeSrc,
      onUpdateFn: this.updateValue.bind(this),
      editorView: this.view,
      readonly: this.readonly,
    });
    return wrap;
  }

  destroy(): void {
    this.widget.destroy();
  }
}
