import { BaseOrgWidget } from './base-org-widget';
import type { Range } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { Decoration } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';
import type { EmbeddedWidget, MultilineEmbeddedWidget } from 'orgnote-api';
import { readonlyFacet } from '../facets';

export class OrgMultilineWidget extends BaseOrgWidget {
  private widget: EmbeddedWidget | undefined;

  constructor(
    view: EditorView,
    orgNode: OrgNode,
    rootNodeSrc: () => OrgNode | null,
    private readonly multilineWidget: MultilineEmbeddedWidget,
  ) {
    super(view, rootNodeSrc, orgNode, multilineWidget);
  }

  public static init(
    editorView: EditorView,
    orgNode: OrgNode,
    rootNodeSrc: () => OrgNode | null,
    multilineWidget: MultilineEmbeddedWidget,
  ): Range<Decoration> {
    const [startOffset, endOffset] = multilineWidget.showRangeOffset ?? [0, 0];
    return Decoration.replace({
      widget: new OrgMultilineWidget(editorView, orgNode, rootNodeSrc, multilineWidget),
      side: 0,
      inclusive: true,
      block: true,
    }).range(orgNode.start + startOffset, orgNode.end + endOffset);
  }

  public override eq(other: OrgMultilineWidget): boolean {
    return (
      other.orgNode.length === this.orgNode.length &&
      other.orgNode.is(this.orgNode.type) &&
      other.orgNode.rawValue === this.orgNode.rawValue
    );
  }

  public eqByNode(orgNode: OrgNode): boolean {
    return (
      orgNode.length === this.orgNode.length &&
      orgNode.is(this.orgNode.type) &&
      orgNode.rawValue === this.orgNode.rawValue
    );
  }

  public sameNodeByOrgNode(orgNode: OrgNode): boolean {
    if (orgNode.isNot(this.orgNode.type)) {
      return false;
    }
    if (orgNode.rawValue === this.orgNode.rawValue) {
      return true;
    }
    return orgNode.start === this.orgNode.start || orgNode.end === this.orgNode.end;
  }

  public override toDOM(): HTMLElement {
    const wrap = document.createElement('div');
    const readonly = this.view.state.facet(readonlyFacet);

    this.widget = this.multilineWidget.widgetBuilder({
      wrap,
      orgNode: this.orgNode,
      editorView: this.view as never,
      rootNodeSrc: this.rootNodeSrc,
      readonly,
      suppressEdit: this.multilineWidget.suppressEdit,
      onUpdateFn: this.updateValue.bind(this),
      onEditMode: this.enterEditMode.bind(this),
    });

    return wrap;
  }

  private enterEditMode(): void {
    this.view.dispatch({
      selection: { anchor: this.orgNode.end, head: this.orgNode.end },
    });
  }

  public override destroy(): void {
    this.widget?.destroy();
  }
}
