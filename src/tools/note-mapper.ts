import { Note } from 'src/models';
import { parse } from 'org-mode-ast';
import { ModelsNote } from 'src/generated/api';

export function mapRawNoteToNote(node: ModelsNote): Note {
  return {
    ...node,
    content: parse(node.content),
  } as Note;
}
