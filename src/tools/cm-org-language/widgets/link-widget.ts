import { Range } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { OrgNode } from 'org-mode-ast';

import { App, ComponentInternalInstance, createApp } from 'vue';

import OrgLink from 'src/components/OrgLink.vue';

export class OrgLinkWidget extends WidgetType {
  private comp: App;

  constructor(
    private readonly orgNode: OrgNode,
    private readonly vueInstance: ComponentInternalInstance
  ) {
    super();
  }

  public static init(
    view: EditorView,
    orgNode: OrgNode,
    vueInstance?: ComponentInternalInstance
  ): Range<Decoration> {
    return Decoration.replace({
      widget: new OrgLinkWidget(orgNode, vueInstance),
      side: 0,
      inclusive: true,
    }).range(orgNode.start, orgNode.end);
  }

  static handleClick(target: HTMLElement, view: EditorView): boolean {
    return;
  }

  public eq(other: OrgLinkWidget) {
    return other.orgNode.rawValue === this.orgNode.rawValue;
  }

  toDOM() {
    const wrap = document.createElement('span');
    this.comp = createApp(OrgLink, {
      node: this.orgNode,
    });
    Object.assign(this.comp._context, this.vueInstance.appContext);
    this.comp.mount(wrap);
    return wrap;
  }

  destroy(): void {
    this.comp.unmount();
  }

  ignoreEvent() {
    return true;
  }
}
