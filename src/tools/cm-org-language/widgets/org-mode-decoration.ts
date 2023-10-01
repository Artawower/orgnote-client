import { OrgInlineWidget } from './org-inline-widget';
import { InlineEmbeddedWidgets } from './widget.model';
import { Range } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import { OrgNode, walkTree } from 'org-mode-ast';

class OrgModeDecorationPlugin {
  static init(
    inlineWidgets: InlineEmbeddedWidgets,
    getOrgNodeTree?: () => OrgNode
  ): OrgModeDecorationPlugin {
    return new OrgModeDecorationPlugin(inlineWidgets, getOrgNodeTree);
  }

  constructor(
    private readonly inlineWidgets: InlineEmbeddedWidgets,
    private readonly getOrgNodeTree?: () => OrgNode
  ) {}

  public buildDecorations(view: EditorView): [DecorationSet, DecorationSet] {
    const orgNode = this.getOrgNodeTree();
    const simpleDecorations: Range<Decoration>[] = [];
    const atomicDecorations: Range<Decoration>[] = [];
    const caretPosition = view.state.selection.main.head;

    view.visibleRanges.forEach(({ from, to }) => {
      walkTree(orgNode, (n: OrgNode) => {
        if (n.start > to) {
          return true;
        }
        if (n.start < from) {
          return;
        }
        const inlineWidget = this.inlineWidgets[n.type];

        const unsatisfied =
          inlineWidget?.satisfied && !inlineWidget?.satisfied?.(n);

        if (!inlineWidget || unsatisfied) {
          return;
        }

        const [startOffset, endOffset] = inlineWidget.showRangeOffset ?? [0, 0];

        if (
          caretPosition >= n.start - startOffset &&
          caretPosition <= n.end + endOffset
        ) {
          return;
        }

        const decoration = OrgInlineWidget.init(view, n, inlineWidget);
        if (decoration) {
          atomicDecorations.push(decoration);
        }
      });
    });

    return [
      Decoration.set(simpleDecorations),
      Decoration.set(atomicDecorations),
    ];
  }
}

export const orgInlineWidgets = (
  getOrgNodeTree: () => OrgNode,
  inlineWidgets: InlineEmbeddedWidgets
) =>
  ViewPlugin.fromClass(
    class {
      public commonDecorations: DecorationSet;
      public atomicDecorations: DecorationSet;
      public decorationPlugin: OrgModeDecorationPlugin;
      private lastPosition: number;

      constructor(view: EditorView) {
        this.decorationPlugin = OrgModeDecorationPlugin.init(
          inlineWidgets,
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
    }
  );
