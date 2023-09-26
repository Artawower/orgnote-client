import { CheckboxWidget } from './checkbox-widget';
import { OrgPriorityWidget } from './org-priority-widget';
import { Range } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import { NodeType, OrgNode, walkTree } from 'org-mode-ast';

import { ComponentInternalInstance } from 'vue';

const atomDecorationHandlers: {
  [key in NodeType]?: {
    init: (
      view: EditorView,
      orgNode: OrgNode,
      vueInstance?: ComponentInternalInstance
    ) => Range<Decoration>;
    handleClick: (target: HTMLElement, view: EditorView) => void;
  };
} = {
  [NodeType.Checkbox]: CheckboxWidget,
  [NodeType.Priority]: OrgPriorityWidget,
};

class OrgModeDecorationPlugin {
  static init(
    vueInstance: ComponentInternalInstance,
    getOrgNodeTree?: () => OrgNode
  ): OrgModeDecorationPlugin {
    return new OrgModeDecorationPlugin(vueInstance, getOrgNodeTree);
  }

  constructor(
    private readonly vueInstance: ComponentInternalInstance,
    private readonly getOrgNodeTree?: () => OrgNode
  ) {}

  public handleClick(target: HTMLElement, view: EditorView): void {
    Object.values(atomDecorationHandlers).forEach((widget) =>
      widget.handleClick(target, view)
    );
  }

  public buildDecorations(view: EditorView): [DecorationSet, DecorationSet] {
    const orgNode = this.getOrgNodeTree();
    const simpleDecorations: Range<Decoration>[] = [];
    const atomicDecorations: Range<Decoration>[] = [];

    view.visibleRanges.forEach(({ from, to }) => {
      walkTree(orgNode, (n) => {
        if (n.start > to) {
          return true;
        }
        if (n.start < from) {
          return;
        }
        const atomicDecoration = this.tryHandleAtomicDecoration(n, view);
        if (atomicDecoration) {
          atomicDecorations.push(atomicDecoration);
        }
      });
    });

    return [null, Decoration.set(atomicDecorations)];
  }

  private tryHandleAtomicDecoration(
    orgNode: OrgNode,
    view: EditorView
  ): Range<Decoration> {
    const decoration = atomDecorationHandlers[orgNode.type]?.init(
      view,
      orgNode,
      this.vueInstance
    );
    return decoration;
  }
}

export const newOrgModeDecorationPlugin = (
  vueInstance: ComponentInternalInstance,
  getOrgNodeTree?: () => OrgNode
) =>
  ViewPlugin.fromClass(
    class {
      public commonDecorations: DecorationSet;
      public atomicDecorations: DecorationSet;
      public decorationPlugin: OrgModeDecorationPlugin;

      constructor(view: EditorView) {
        this.decorationPlugin = OrgModeDecorationPlugin.init(
          vueInstance,
          getOrgNodeTree
        );
        this.initDecorations(view);
      }

      private initDecorations(view: EditorView): void {
        [this.commonDecorations, this.atomicDecorations] =
          this.decorationPlugin.buildDecorations(view);
      }

      public update(update: ViewUpdate): void {
        if (update.docChanged || update.viewportChanged) {
          this.initDecorations(update.view);
        }
      }
    },
    {
      decorations: (v) => v.atomicDecorations,

      eventHandlers: {
        mousedown: (e, view) => {
          const target = e.target as HTMLElement;
          Object.values(atomDecorationHandlers).forEach((widget) =>
            widget.handleClick(target, view)
          );
        },
      },
      provide: (plugin) =>
        // TODO: master doesn't work...need to fix somehow.
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.atomicDecorations || Decoration.none;
        }),
    }
  );
