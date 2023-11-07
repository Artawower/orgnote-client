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
    readonly: boolean,
    getOrgNodeTree?: () => OrgNode
  ): OrgModeDecorationPlugin {
    return new OrgModeDecorationPlugin(inlineWidgets, readonly, getOrgNodeTree);
  }

  constructor(
    private readonly inlineWidgets: InlineEmbeddedWidgets,
    private readonly readonly: boolean,
    private readonly getRootNode?: () => OrgNode
  ) {}

  public buildDecorations(view: EditorView): [DecorationSet, DecorationSet] {
    const orgNode = this.getRootNode();
    const simpleDecorations: Range<Decoration>[] = [];
    const atomicDecorations: Range<Decoration>[] = [];
    const caretPosition = view.state.selection.main.head;

    const [visibleStart, visibleEnd] = [
      view.visibleRanges[0].from,
      view.visibleRanges[view.visibleRanges.length - 1].to,
    ];

    walkTree(orgNode, (n: OrgNode) => {
      if (n.start > visibleEnd) {
        return true;
      }
      if (n.start < visibleStart) {
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
        view.hasFocus &&
        !inlineWidget.ignoreEditing &&
        caretPosition >= n.start - startOffset &&
        caretPosition <= n.end + endOffset
      ) {
        return;
      }

      const decoration = OrgInlineWidget.init(
        view,
        n,
        inlineWidget,
        this.getRootNode,
        this.readonly
      );
      if (decoration) {
        atomicDecorations.push(decoration);
      }
    });

    return [
      Decoration.set(simpleDecorations),
      Decoration.set(atomicDecorations),
    ];
  }
}

export const orgInlineWidgets = (
  getOrgNodeTree: () => OrgNode,
  inlineWidgets: InlineEmbeddedWidgets,
  readonly: boolean
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
          readonly,
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
        this.lastPosition = caretPosition;
        if (
          update.docChanged ||
          update.viewportChanged ||
          update.focusChanged ||
          caretPositionChanged
        ) {
          this.initDecorations(update.view);
        }
      }
    },
    {
      decorations: (v) => v.atomicDecorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of((view) => {
          return view.plugin(plugin)?.atomicDecorations || Decoration.none;
        }),
    }
  );
