import { BaseOrgWidget } from 'src/utils/org-editor/widgets/base-org-widget';
import type { Range } from '@codemirror/state';
import type { EditorView, WidgetType } from '@codemirror/view';
import { Decoration } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';
import type { EmbeddedWidget, MultilineEmbeddedWidget } from 'orgnote-api';
import { readonlyFacet } from '../facets';
import { isWidgetConfigChanged } from './multiline-widgets';

export class OrgMultilineWidget extends BaseOrgWidget {
  constructor(
    view: EditorView,
    orgNode: OrgNode,
    rootNodeSrc: () => OrgNode | null,
    public readonly multilineWidget: MultilineEmbeddedWidget,
    private readonly readonlyAtMount: boolean = false,
  ) {
    super(view, rootNodeSrc, orgNode, multilineWidget);
  }

  private destroyed = false;
  private widget: EmbeddedWidget | undefined;

  public getReadonly(): boolean {
    return this.readonlyAtMount;
  }

  public static init(
    editorView: EditorView,
    orgNode: OrgNode,
    rootNodeSrc: () => OrgNode | null,
    multilineWidget: MultilineEmbeddedWidget,
    docLength: number,
    readonly: boolean = false,
  ): Range<Decoration> {
    return OrgMultilineWidget.createDecoration(
      new OrgMultilineWidget(editorView, orgNode, rootNodeSrc, multilineWidget, readonly),
      orgNode,
      multilineWidget,
      docLength,
    );
  }

  public static createDecoration(
    widget: OrgMultilineWidget,
    orgNode: OrgNode,
    multilineWidget: MultilineEmbeddedWidget,
    docLength: number,
  ): Range<Decoration> {
    const [startOffset, endOffset] = multilineWidget.showRangeOffset ?? [0, 0];
    const safeEnd = Math.min(orgNode.end + endOffset, docLength);
    return Decoration.replace({
      widget,
      side: 0,
      inclusive: true,
      block: true,
    }).range(Math.max(0, orgNode.start + startOffset), safeEnd);
  }

  public override eq(other: WidgetType): boolean {
    if (!(other instanceof OrgMultilineWidget)) return false;
    if (this.destroyed || other.isDestroyed()) return false;
    if (this.readonlyAtMount !== other.readonlyAtMount) return false;
    if (isWidgetConfigChanged(this.multilineWidget, other.multilineWidget)) return false;
    return other.orgNode.is(this.orgNode.type) && other.orgNode.rawValue === this.orgNode.rawValue;
  }

  public override updateDOM(): boolean {
    const canReuse = Boolean(this.widget) && !this.destroyed;
    return canReuse;
  }

  public isDestroyed(): boolean {
    return this.destroyed;
  }

  public sameNodeByOrgNode(orgNode: OrgNode): boolean {
    return (
      orgNode.is(this.orgNode.type) &&
      orgNode.rawValue === this.orgNode.rawValue &&
      orgNode.start === this.orgNode.start
    );
  }

  public override toDOM(): HTMLElement {
    this.destroyed = false;
    const wrap = document.createElement('div');
    wrap.setAttribute('contenteditable', 'false');
    const normalizedType = this._orgNode.type.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    wrap.classList.add(`org-embedded-${normalizedType}`);

    this.widget = this.multilineWidget.widgetBuilder!({
      wrap,
      orgNode: this._orgNode,
      orgNodeGetter: () => this._orgNode,
      editorView: this.view as never,
      rootNodeSrc: this.rootNodeSrc,
      readonly: this.view.state.facet(readonlyFacet),
      suppressEdit: this.multilineWidget.suppressEdit,
      onUpdateFn: this.updateValue.bind(this),
      onEditMode: () =>
        this.view.dispatch({
          selection: { anchor: this._orgNode.end, head: this._orgNode.end },
        }),
    });

    return wrap;
  }

  public override destroy(): void {
    this.destroyed = true;
    this.widget?.destroy();
    this.widget = undefined;
  }
}
