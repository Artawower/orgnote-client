import { Note, NotePreview } from 'orgnote-api';

export function convertNoteToNotePreview(note: Note): NotePreview {
  return {
    id: note.id,
    meta: note.meta,
    filePath: note.filePath,
    isMy: note.isMy,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    bookmarked: note.bookmarked,
    encrypted: note.encrypted,
  };
}
