import Dexie from 'dexie';
import { Note } from 'src/models/note';
import { NotePreview } from 'src/models';
import { convertNoteToNotePreview } from './note-mapper';
import { BaseRepository } from './repository';

export class NoteRepository extends BaseRepository {
  public static storeName = 'notes';

  public static readonly indexes =
    '++id, meta.title, meta.description, createdAt, *meta.fileTags';

  get store(): Dexie.Table<Note, number> {
    return this.db.table(NoteRepository.storeName);
  }

  async getNotesAfterUpdateTime(updatedTime?: Date): Promise<Note[]> {
    if (!updatedTime) {
      return this.store.toArray();
    }
    return this.store.where('createdAt').above(updatedTime).toArray();
  }

  async saveNotes(notes: Note[]): Promise<void> {
    await this.store.bulkPut(notes);
  }

  async putNote(note: Note): Promise<void> {
    await this.store.put(note);
  }

  async getById(id: string): Promise<Note> {
    return this.store.get({ id });
  }

  async getNotePreviews(
    limit: number,
    offset: number,
    searchText?: string
  ): Promise<NotePreview[]> {
    const result: NotePreview[] = [];
    const initialStore = searchText
      ? this.store.where('meta.title').startsWithIgnoreCase(searchText)
      : this.store;

    return initialStore
      .limit(limit)
      .offset(offset)
      .each((n) => result.push(convertNoteToNotePreview(n)))
      .then(() => result);
  }

  async count(): Promise<number> {
    return this.store.count();
  }
}
