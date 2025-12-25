import { BaseOrgWidget } from './base-org-widget';
import type { Range } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { Decoration } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';
import type { MultilineEmbeddedWidget } from 'orgnote-api';
import { readonlyFacet } from '../facets';

export class OrgMultilineWidget extends BaseOrgWidget {
  constructor(
    view: EditorView,
    orgNode: OrgNode,
    rootNodeSrc: () => OrgNode | null,
    public readonly multilineWidget: MultilineEmbeddedWidget,
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
    return other.orgNode.is(this.orgNode.type) && other.orgNode.rawValue === this.orgNode.rawValue;
  }

  public sameNodeByOrgNode(orgNode: OrgNode): boolean {
    return (
      orgNode.is(this.orgNode.type) &&
      (orgNode.rawValue === this.orgNode.rawValue ||
        orgNode.start === this.orgNode.start ||
        orgNode.end === this.orgNode.end)
    );
  }

  public override toDOM(): HTMLElement {
    const wrap = document.createElement('div');
    const normalizedType = this._orgNode.type.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    wrap.classList.add(`org-embedded-${normalizedType}`);

    this.multilineWidget.widgetBuilder!({
      wrap,
      orgNode: this._orgNode,
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
}
