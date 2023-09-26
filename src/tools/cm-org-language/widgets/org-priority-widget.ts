import { Range } from '@codemirror/state';
import { Decoration, EditorView, WidgetType } from '@codemirror/view';
import { OrgNode } from 'org-mode-ast';

import {
  App,
  ComponentInternalInstance,
  createApp,
} from 'vue';

import OrgPriority from './OrgPriority.vue';

export class OrgPriorityWidget extends WidgetType {
  private comp: App;

  constructor(
    private readonly priority: string,
    private readonly vueInstance: ComponentInternalInstance
  ) {
    super();
  }

  // TODO: master vue context is really bad idea as dependency.
  // need to provide special function for rendering nested components via hashmap
  public static init(
    view: EditorView,
    orgNode: OrgNode,
    vueInstance?: ComponentInternalInstance
  ): Range<Decoration> {
    return Decoration.replace({
      widget: new OrgPriorityWidget(orgNode.children.get(1).value, vueInstance),
      side: -1,
    }).range(orgNode.start, orgNode.end);
  }

  static handleClick(target: HTMLElement, view: EditorView): boolean {
    return;
  }

  public eq(other: OrgPriorityWidget) {
    return other.priority == this.priority;
  }

  toDOM() {
    const wrap = document.createElement('span');
    this.comp = createApp(OrgPriority, {
      priority: this.priority,
    });
    Object.assign(this.comp._context, this.vueInstance.appContext);
    this.comp.mount(wrap);
    return wrap;
  }

  destroy(): void {
    this.comp.unmount();
  }

  ignoreEvent() {
    return false;
  }
}
