import { Note } from 'src/models';
import { parse, withMetaInfo } from 'org-mode-ast';
import { ModelsPublicNote } from 'src/generated/api';

export function mapRawNoteToNote(node: ModelsPublicNote): Note {
  return {
    ...node,
    content: withMetaInfo(parse(node.content)),
  } as Note;
}
