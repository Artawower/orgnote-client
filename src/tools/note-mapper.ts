import { Note } from 'src/models';
import { parse, withMetaInfo } from 'org-mode-ast';
import { ModelsPublicNote, ModelsPublicUser } from 'src/generated/api';

export function mapRawNoteToNote(
  node: ModelsPublicNote,
  user: ModelsPublicUser
): Note {
  return {
    ...node,
    content: withMetaInfo(parse(node.content)),
    isMyNote: node.author?.id === user?.id,
  } as Note;
}
