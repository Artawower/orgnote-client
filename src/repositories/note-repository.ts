import { join, Note, NotePreview } from 'orgnote-api';
import { migrator } from './migrator';
import { convertNoteToNotePreview } from './note-mapper';
import { BaseRepository } from './repository';
import Dexie, { Collection } from 'dexie';
import {
  FilePathInfo,
  NoteRepository as INoteRepository,
} from 'orgnote-api/models';
import { ModelsPublicNoteEncryptionTypeEnum } from 'orgnote-api/remote-api';

export class NoteRepository extends BaseRepository implements INoteRepository {
  public static storeName = 'notes';

  public static readonly migrations = migrator<Note>()
    .v(1)
    .indexes(
      '++id, meta.title, meta.description, createdAt, updatedAt, *meta.fileTags'
    )
    .v(2)
    .indexes(
      '++id, meta.title, meta.description, createdAt, updatedAt, *meta.fileTags, touchedAt'
    )
    .upgrade((n) => (n.touchedAt = new Date().toISOString()))
    .v(6)
    .indexes(
      '++id, meta.title, meta.description, createdAt, updatedAt, *meta.fileTags, touchedAt'
    )
    .upgrade(
      (n) =>
        (n.encryptionType =
          n.encrypted as unknown as ModelsPublicNoteEncryptionTypeEnum)
    )
    .v(7)
    .indexes(
      '++id, meta.title, meta.description, createdAt, updatedAt, *meta.fileTags, touchedAt, filePath'
    )
    .build();

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

  async getByPath(filePath: string[]): Promise<Note> {
    const filtered = await this.store
      .filter((n) => !n.deleted && join(...n.filePath) === join(...filePath))
      .toArray();

    return filtered?.[0];
  }

  async getNotePreviews(
    {
      limit,
      offset = 0,
      searchText,
      tags,
      bookmarked,
    }: {
      limit?: number;
      offset?: number;
      searchText?: string;
      tags?: string[];
      bookmarked?: boolean;
    } = { offset: 0 }
  ): Promise<NotePreview[]> {
    const result: NotePreview[] = [];
    const searchCollection = this.store
      .orderBy('touchedAt')
      .reverse()
      .filter((n) => !n.deleted);
    const initialStore = this.applySearchInfo(
      searchCollection,
      searchText,
      tags,
      bookmarked
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
    tags?: string[],
    bookmarked?: boolean
  ): Collection<Note, string> {
    return collection.filter((n) =>
      this.searchMath(n, searchText, tags, bookmarked)
    );
  }

  private searchMath(
    note: Note,
    searchText?: string,
    tags?: string[],
    bookmarked?: boolean
  ): boolean {
    if (!searchText && !tags?.length && bookmarked == null) {
      return true;
    }

    const titleMatched =
      searchText &&
      note.meta.title?.toLowerCase().includes(searchText?.toLowerCase());

    const descriptionMatched =
      searchText &&
      note.meta.description?.toLowerCase().includes(searchText?.toLowerCase());

    const tagMatched = !tags?.length || this.tagMatched(note, tags);

    const bookmarkedMatched =
      bookmarked == null || note.bookmarked === bookmarked;

    const searchMatched = descriptionMatched || titleMatched;

    const matched =
      (searchMatched || !searchText) && bookmarkedMatched && tagMatched;

    return matched;
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

  async touchNote(noteId: string): Promise<void> {
    await this.store.update(noteId, { touchedAt: new Date().toISOString() });
  }

  async getTagsStatistic(): Promise<{ tag: string; count: number }[]> {
    const tags: { tag: string; count: number }[] = [];
    return this.store
      .filter((n) => !n.deleted)
      .each((n) => {
        n.meta.fileTags?.forEach((t) => {
          const tag = tags.find((tag) => tag.tag === t);
          if (tag) {
            tag.count++;
            return;
          }
          tags.push({ tag: t, count: 1 });
        });
      })
      .then(() => tags.sort((a, b) => b.count - a.count));
  }

  async addBookmark(noteId: string): Promise<void> {
    await this.store.update(noteId, { bookmarked: true });
  }

  async deleteBookmark(noteId: string): Promise<void> {
    await this.store.update(noteId, { bookmarked: false });
  }

  async modify(
    modifyCallback: (note: Note, ref: { value: Note }) => void
  ): Promise<void> {
    await this.store.toCollection().modify(modifyCallback);
  }

  async getIds(filterCb: (n: Note) => boolean = () => true): Promise<string[]> {
    const ids: string[] = [];
    return this.store
      .filter((n) => !n.deleted)
      .filter(filterCb)
      .each((n) => ids.push(n.id))
      .then(() => ids);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }
}
