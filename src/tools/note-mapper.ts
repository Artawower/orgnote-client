import { Note } from 'src/models';
import { parse } from 'org-mode-ast';
import { ModelsPublicNote } from 'src/generated/api';

export function mapRawNoteToNote(node: ModelsPublicNote): Note {
  return {
    ...node,
    content: parse(node.content),
  } as Note;
}
