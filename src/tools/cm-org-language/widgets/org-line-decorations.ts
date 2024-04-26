import { Range } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import { NodeType, OrgNode, findParent, walkTree } from 'org-mode-ast';
import { OrgLineClasses } from 'orgnote-api';

export const orgLineDecoration = (
  getOrgNodeTree: () => OrgNode,
  orgLineClasses: OrgLineClasses
) => {
  return ViewPlugin.fromClass(
    class {
      public decorations: DecorationSet = Decoration.none;
      private lastPosition: number;

      constructor() {
        this.initDecorations();
      }

      private initDecorations(): void {
        const orgNode = getOrgNodeTree();

        const lineDecorations: Range<Decoration>[] = [];

        walkTree(orgNode, (n: OrgNode) => {
          const lineDecoration = orgLineClasses[n.type]?.class;
          if (!lineDecoration) {
            return false;
          }
          const lineClass =
            typeof lineDecoration === 'function'
              ? lineDecoration(n)
              : lineDecoration;

          if (!lineClass) {
            return;
          }

          this.applyLineDecorationsForSrcParentBLock(
            lineDecorations,
            n,
            lineClass
          );

          lineDecorations.push(
            Decoration.line({
              class: lineClass,
            }).range(n.start, n.start)
          );
        });

        lineDecorations.sort((p, c) => p.from - c.from);

        this.decorations = Decoration.set(lineDecorations);
      }

      private applyLineDecorationsForSrcParentBLock(
        lineDecorations: Range<Decoration>[],
        node: OrgNode,
        lineClass: string
      ): void {
        // NOTE: this small hack needed to highlight lines inside nested src block.
        // Cause nested src block is just a string with \n characters.
        const srcParent = findParent(node, (n) => n.is(NodeType.SrcBlock));
        if (!srcParent) {
          return;
        }
        const linedValues = node.value?.split('\n');
        let pos = node.start;

        linedValues?.forEach((v) => {
          const lineDecoration = Decoration.line({
            class: lineClass,
          }).range(pos, pos);
          pos += v.length + 1;

          lineDecorations.push(lineDecoration);
        });
      }

      public update(update: ViewUpdate): void {
        const caretPosition = update.state.selection.main.head;
        const caretPositionChanged = this.lastPosition !== caretPosition;
        if (
          update.docChanged ||
          update.viewportChanged ||
          caretPositionChanged
        ) {
          this.initDecorations();
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
};
