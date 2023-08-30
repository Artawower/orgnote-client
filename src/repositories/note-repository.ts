import Dexie from 'dexie';
import { Note } from 'models/note';
import { BaseRepository } from './repository';

export class NoteRepository extends BaseRepository {
  public static storeName = 'notes';

  public static readonly indexes =
    '++id, meta.title, meta.description, *meta.fileTags';

  get store(): Dexie.Table<Note, number> {
    return this.db.table(NoteRepository.storeName);
  }

  async getNotes(): Promise<Note[]> {
    return this.db.table(NoteRepository.storeName).toArray();
  }

  async saveNotes(notes: Note[]): Promise<void> {
    await this.store.bulkPut(notes);
  }

  async putNote(note: Note): Promise<void> {
    await this.store.put(note);
  }
}
