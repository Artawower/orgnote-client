import { convertNoteToNotePreview } from './note-mapper';
import { BaseRepository } from './repository';
import Dexie, { Collection } from 'dexie';
import { Note, NotePreview } from 'src/models';

export interface FilePathInfo {
  filePath: string[];
  id: string;
}

export class NoteRepository extends BaseRepository {
  public static storeName = 'notes';

  public static readonly indexes =
    '++id, meta.title, meta.description, createdAt, updatedAt, *meta.fileTags';

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
      .where('updatedAt')
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
    limit?: number,
    offset?: number,
    searchText?: string,
    tags?: string[]
  ): Promise<NotePreview[]> {
    const result: NotePreview[] = [];
    const searchCollection = this.store
      .orderBy('createdAt')
      .reverse()
      .filter((n) => !n.deleted);
    const initialStore = this.applySearchInfo(
      searchCollection,
      searchText,
      tags
    );
    if (!limit) {
      return initialStore
        .each((n) => result.push(convertNoteToNotePreview(n)))
        .then(() => result);
    }
    return initialStore
      .offset(offset)
      .limit(limit)
      .each((n) => result.push(convertNoteToNotePreview(n)))
      .then(() => result);
  }

  private applySearchInfo(
    collection: Collection<Note, string>,
    searchText?: string,
    tags?: string[]
  ): Collection<Note, string> {
    return collection.filter((n) => this.searchMath(n, searchText, tags));
  }

  private searchMath(
    note: Note,
    searchText?: string,
    tags?: string[]
  ): boolean {
    if (!searchText && !tags?.length) {
      return true;
    }

    const titleMatched =
      searchText &&
      note.meta.title?.toLowerCase().includes(searchText?.toLowerCase());

    const descriptionMatched =
      searchText &&
      note.meta.description?.toLowerCase().includes(searchText?.toLowerCase());

    const tagMatched = this.tagMatched(note, tags);

    return descriptionMatched || titleMatched || tagMatched;
  }

  private tagMatched(note: Note, tags: string[] = []): boolean {
    return note.meta.fileTags?.some((t) => {
      const found = tags.find((tag) =>
        t.toLowerCase().includes(tag.toLowerCase())
      );
      return found;
    });
  }

  async deleteNotes(noteIds: string[]): Promise<void> {
    await this.store.bulkDelete(noteIds);
  }

  async markAsDeleted(noteIds: string[]): Promise<void> {
    await this.store.bulkUpdate(
      noteIds.map((id) => ({
        key: id,
        changes: { deleted: new Date() },
      }))
    );
  }

  async bulkPartialUpdate(
    updates: { id: string; changes: Partial<Note> }[]
  ): Promise<void> {
    if (!updates.length) {
      return;
    }
    await this.store.bulkUpdate(
      updates.map((update) => ({
        key: update.id,
        changes: { ...update.changes, updatedAt: new Date().toISOString() },
      }))
    );
  }

  async count(searchText?: string, tags?: string[]): Promise<number> {
    return this.store
      .filter((n) => !n.deleted && this.searchMath(n, searchText, tags))
      .count();
  }

  async getFilePaths(): Promise<FilePathInfo[]> {
    const pathInfo: FilePathInfo[] = [];

    return this.store
      .filter((n) => !n.deleted)
      .each((n) => {
        pathInfo.push({ id: n.id, filePath: n.filePath });
      })
      .then(() => pathInfo);
  }
}
