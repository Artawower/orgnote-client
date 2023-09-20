import Dexie from 'dexie';
import { Note, NotePreview } from 'src/models';
import { convertNoteToNotePreview } from './note-mapper';
import { BaseRepository } from './repository';

export interface FilePathInfo {
  filePath: string[];
  id: string;
}

export class NoteRepository extends BaseRepository {
  public static storeName = 'notes';

  public static readonly indexes =
    '++id, meta.title, meta.description, createdAt, *meta.fileTags';

  get store(): Dexie.Table<Note, string> {
    return this.db.table(NoteRepository.storeName);
  }

  async getNotesAfterUpdateTime(updatedTime?: string): Promise<Note[]> {
    const notes: Note[] = [];
    if (!updatedTime) {
      return this.store
        .each((n) => !n.deleted && notes.push(n))
        .then(() => notes);
    }
    return this.store
      .where('createdAt')
      .above(updatedTime)
      .each((n) => !n.deleted && notes.push(n))
      .then(() => notes);
  }

  async getDeletedNotes(): Promise<Note[]> {
    const deletedNotes: Note[] = [];
    return await this.store
      .each((n) => {
        if (n.deleted) {
          deletedNotes.push(n);
        }
      })
      .then(() => deletedNotes);
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
    const searchCollection = this.store.orderBy('createdAt').reverse();
    const initialStore = searchText
      ? searchCollection.filter((n) =>
          n.meta.title?.toLowerCase().includes(searchText.toLowerCase())
        )
      : searchCollection;

    return initialStore
      .offset(offset)
      .limit(limit)
      .each((n) => result.push(convertNoteToNotePreview(n)))
      .then(() => result);
  }

  async deleteNotes(noteIds: string[]): Promise<void> {
    await this.store.bulkDelete(noteIds);
  }

  async markNotesAsDeleted(noteIds: string[]): Promise<void> {
    await this.store.bulkUpdate(
      noteIds.map((id) => ({
        key: id,
        changes: { deleted: true },
      }))
    );
  }

  async count(searchText?: string): Promise<number> {
    if (!searchText) {
      return this.store.count();
    }
    const lowerCaseSearchText = searchText?.toLowerCase();
    return this.store
      .filter((n) => n.meta.title?.toLowerCase().includes(lowerCaseSearchText))
      .count();
  }

  async getFilePaths(): Promise<FilePathInfo[]> {
    const pathInfo: FilePathInfo[] = [];

    return this.store
      .each((n) => {
        pathInfo.push({ id: n.id, filePath: n.filePath });
      })
      .then(() => pathInfo);
  }
}
