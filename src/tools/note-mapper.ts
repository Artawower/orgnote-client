import { RawNote, Note } from 'src/models';
import { parse } from 'org-mode-ast';

export function mapRawNoteToNote(node: RawNote): Note {
  return {
    ...node,
    content: parse(node.content),
  };
}
