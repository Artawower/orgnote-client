import { EmbeddedOrgWidget, WidgetBuilder } from './multiline-widgets';
import { Range } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { OrgNode } from 'org-mode-ast';

import OrgTable from 'src/components/OrgTable.vue';

export class OrgMultilineWidget extends WidgetType {
  private readonly editIcon = `<svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4 5L15 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 8H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M4 11H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18.4563 13.5423L13.9268 18.0719C13.6476 18.3511 13.292 18.5414 12.9048 18.6188L10.8153 19.0367L11.2332 16.9472C11.3106 16.5601 11.5009 16.2045 11.7801 15.9253L16.3096 11.3957M18.4563 13.5423L19.585 12.4135C19.9755 12.023 19.9755 11.3898 19.585 10.9993L18.8526 10.2669C18.4621 9.8764 17.8289 9.8764 17.4384 10.2669L16.3096 11.3957M18.4563 13.5423L16.3096 11.3957" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

  private editorBadge: HTMLElement;
  private widget: EmbeddedOrgWidget;

  constructor(
    private readonly editorView: EditorView,
    private readonly orgNode: OrgNode,
    private readonly widgetBuilder: WidgetBuilder
  ) {
    super();
  }

  public static init(
    editorView: EditorView,
    orgNode: OrgNode,
    widgetBuilder: WidgetBuilder
  ): Range<Decoration> {
    return Decoration.replace({
      widget: new OrgMultilineWidget(editorView, orgNode, widgetBuilder),
      side: 0,
      inclusive: true,
      block: true,
    }).range(orgNode.start, orgNode.end);
  }

  static handleClick(target: HTMLElement, view: EditorView): boolean {
    return;
  }

  public eq(other: OrgMultilineWidget) {
    return other.orgNode.rawValue === this.orgNode.rawValue;
  }

  private initEditorBadge(): void {
    this.editorBadge = document.createElement('div');
    this.editorBadge.className = 'org-widget-edit-badge';
    this.editorBadge.style.display = 'block';
    this.editorBadge.style.position = 'absolute';
    this.editorBadge.style.top = '0';
    this.editorBadge.style.left = '-36px';
    this.editorBadge.style.zIndex = '5';
    this.editorBadge.style.cursor = 'pointer';
    this.editorBadge.innerHTML = this.editIcon;
    this.editorBadge.addEventListener(
      'click',
      this.editMultilineWidget.bind(this)
    );
  }

  toDOM() {
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    this.widget = this.widgetBuilder(wrap, this.orgNode);
    this.initEditorBadge();
    wrap.appendChild(this.editorBadge);
    return wrap;
  }

  private editMultilineWidget(event: MouseEvent): void {
    event.preventDefault();
    this.editorView.dispatch({
      selection: { anchor: this.orgNode.end, head: this.orgNode.end },
    });
  }

  destroy(): void {
    this.widget.destroy();
    this.editorBadge.removeEventListener('click', this.editMultilineWidget);
    this.editorBadge.remove();
  }

  ignoreEvent() {
    return true;
  }
}
