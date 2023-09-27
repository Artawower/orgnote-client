import { CheckboxWidget } from './checkbox-widget';
import { OrgLinkWidget } from './link-widget';
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
  [NodeType.Link]: OrgLinkWidget,
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
    const caretPosition = view.state.selection.main.head;

    view.visibleRanges.forEach(({ from, to }) => {
      walkTree(orgNode, (n) => {
        if (n.start > to) {
          return true;
        }
        if (n.start < from) {
          return;
        }
        if (caretPosition >= n.start - 1 && caretPosition <= n.end + 1) {
          return;
        }
        const atomicDecoration = this.tryHandleAtomicDecoration(n, view);
        if (atomicDecoration) {
          atomicDecorations.push(atomicDecoration);
        }
      });
    });

    return [
      Decoration.set(simpleDecorations),
      Decoration.set(atomicDecorations),
    ];
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
      private lastPosition: number;

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
        const caretPosition = update.state.selection.main.head;
        // TODO: master check also that we have neighbor decorations.
        // There is no sense to update decorations when
        // caret changed but we have no decorations around.
        const caretPositionChanged = this.lastPosition !== caretPosition;
        if (
          update.docChanged ||
          update.viewportChanged ||
          caretPositionChanged
        ) {
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
