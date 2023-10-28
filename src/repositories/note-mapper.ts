import { Note, NotePreview } from 'src/models';

export function convertNoteToNotePreview(note: Note): NotePreview {
  return {
    id: note.id,
    meta: note.meta,
    filePath: note.filePath,
    isMy: note.isMy,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
}
