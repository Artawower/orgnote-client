import { Note } from 'src/models';
import { parse, withMetaInfo } from 'org-mode-ast';
import { ModelsPublicNote, ModelsPublicUser } from 'src/generated/api';

export function mapRawNoteToNote(
  node: ModelsPublicNote,
  user: ModelsPublicUser
): Note {
  console.log('✎: [line 9][note-mapper.ts] node: ', node);
  console.log('✎: [line 9][note-mapper.ts] user: ', user);
  return {
    ...node,
    content: withMetaInfo(parse(node.content)),
    isMyNote: node.author?.id === user?.id,
  } as Note;
}
