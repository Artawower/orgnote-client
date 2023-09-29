import {
  EmbeddedOrgWidget,
  InlineEmbeddedWidget,
  WidgetBuilder,
} from './widget.model';
import { Range } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { OrgNode } from 'org-mode-ast';

export class OrgInlineWidget extends WidgetType {
  private widget: EmbeddedOrgWidget;
  constructor(
    private readonly view: EditorView,
    private readonly orgNode: OrgNode,
    private readonly widgetBuilder: WidgetBuilder,
    public readonly ignoredEvent: boolean = false,
    private readonly wrapComponent?: string
  ) {
    super();
  }

  public static init(
    view: EditorView,
    orgNode: OrgNode,
    inlineWidget: InlineEmbeddedWidget
  ): Range<Decoration> {
    const [startOffset, endOffset] = inlineWidget.showRangeOffset ?? [0, 0];
    return Decoration[inlineWidget.decorationType]({
      widget: new OrgInlineWidget(
        view,
        orgNode,
        inlineWidget.widgetBuilder,
        inlineWidget.ignoreEvent,
        inlineWidget.wrapComponent
      ),
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
    const wrap = document.createElement(this.wrapComponent ?? 'span');
    this.widget = this.widgetBuilder(
      wrap,
      this.orgNode,
      this.updateValue.bind(this)
    );
    return wrap;
  }

  private updateValue(newVal: string): void {
    this.view.dispatch({
      changes: {
        from: this.orgNode.start,
        to: this.orgNode.end,
        insert: newVal,
      },
    });
  }

  public ignoreEvent(): boolean {
    return this.ignoredEvent;
  }

  destroy(): void {
    this.widget.destroy();
  }
}
