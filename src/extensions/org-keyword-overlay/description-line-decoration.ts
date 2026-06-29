import type { EditorExtension } from 'orgnote-api';
import { RangeSetBuilder } from '@codemirror/state';
import {
  Decoration,
  EditorView,
  ViewPlugin,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view';

const DESCRIPTION_PATTERN = /^#\+DESCRIPTION:/i;
const descriptionLineDecoration = Decoration.line({ class: 'org-description-line' });

const buildDescriptionDecorations = (view: EditorView): DecorationSet => {
  const builder = new RangeSetBuilder<Decoration>();

  for (let lineNumber = 1; lineNumber <= view.state.doc.lines; lineNumber += 1) {
    const line = view.state.doc.line(lineNumber);
    if (DESCRIPTION_PATTERN.test(line.text)) builder.add(line.from, line.from, descriptionLineDecoration);
  }

  return builder.finish();
};

const descriptionLinePlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDescriptionDecorations(view);
    }

    update(update: ViewUpdate): void {
      if (!update.docChanged && !update.viewportChanged) return;
      this.decorations = buildDescriptionDecorations(update.view);
    }
  },
  {
    decorations: (plugin) => plugin.decorations,
  },
);

const descriptionLineTheme = EditorView.theme({
  '.org-description-line': {
    color: 'var(--fg-muted)',
    fontSize: 'var(--font-size-md)',
  },
});

export const descriptionLineDecorationExtension: EditorExtension = () => [
  descriptionLinePlugin,
  descriptionLineTheme,
];
