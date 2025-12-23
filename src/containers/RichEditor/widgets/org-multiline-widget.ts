import { BaseOrgWidget } from './base-org-widget';
import type { Range } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { Decoration } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';
import type { EmbeddedWidget, MultilineEmbeddedWidget } from 'orgnote-api';

const EDIT_ICON = `<svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 5L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 11H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18.4563 13.5423L13.9268 18.0719C13.6476 18.3511 13.292 18.5414 12.9048 18.6188L10.8153 19.0367L11.2332 16.9472C11.3106 16.5601 11.5009 16.2045 11.7801 15.9253L16.3096 11.3957M18.4563 13.5423L19.585 12.4135C19.9755 12.023 19.9755 11.3898 19.585 10.9993L18.8526 10.2669C18.4621 9.8764 17.8289 9.8764 17.4384 10.2669L16.3096 11.3957M18.4563 13.5423L16.3096 11.3957" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

export class OrgMultilineWidget extends BaseOrgWidget {
  private editBadge: HTMLElement | undefined;
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
      widget: new OrgMultilineWidget(
        editorView,
        orgNode,
        rootNodeSrc,
        multilineWidget,
      ),
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

  private initEditorBadge(wrap: HTMLElement): void {
    if (this.multilineWidget.suppressEdit) {
      return;
    }
    this.editBadge = document.createElement('div');
    this.editBadge.innerHTML = EDIT_ICON;
    this.editBadge.className = 'org-widget-edit-badge';
    this.editBadge.style.position = 'absolute';
    this.editBadge.style.cursor = 'pointer';
    this.editBadge.addEventListener('click', this.editMultilineWidget.bind(this));
    wrap.appendChild(this.editBadge);
  }

  public override toDOM(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.classList.add('org-multiline-widget');
    wrap.addEventListener('touchstart', (e: Event) => e.stopPropagation());
    wrap.addEventListener('mousedown', (e: Event) => e.stopPropagation());

    this.widget = this.multilineWidget.widgetBuilder({
      wrap,
      orgNode: this.orgNode,
      editorView: this.view as never,
      rootNodeSrc: this.rootNodeSrc,
      onUpdateFn: this.updateValue.bind(this),
    });

    this.initEditorBadge(wrap);
    return wrap;
  }

  private editMultilineWidget(event?: MouseEvent): void {
    event?.preventDefault();
    this.view.dispatch({
      selection: { anchor: this.orgNode.end, head: this.orgNode.end },
    });
  }

  public override destroy(): void {
    this.widget?.destroy();
    this.editBadge?.removeEventListener('click', this.editMultilineWidget);
    this.editBadge?.remove();
  }
}
