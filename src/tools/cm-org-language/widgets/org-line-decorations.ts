import { OrgLineClasses } from './line-decoration.model';
import { Range } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import { OrgNode, walkTree } from 'org-mode-ast';

export const orgLineDecoration = (
  getOrgNodeTree: () => OrgNode,
  orgLineClasses: OrgLineClasses
) =>
  ViewPlugin.fromClass(
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
          const lineDecoration = orgLineClasses[n.type];
          if (!lineDecoration) {
            return false;
          }
          lineDecorations.push(
            Decoration.line({
              class:
                typeof lineDecoration === 'function'
                  ? lineDecoration(n)
                  : lineDecoration,
            }).range(n.start, n.start)
          );
        });

        this.decorations = Decoration.set(lineDecorations);
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
