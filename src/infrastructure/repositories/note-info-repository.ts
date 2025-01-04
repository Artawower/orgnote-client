import type { NoteInfo } from 'orgnote-api';
import { join } from 'orgnote-api';
import { migrator } from './migrator';
import type Dexie from 'dexie';
import type { FilePathInfo, NoteInfoRepository } from 'orgnote-api';
import type { ModelsPublicNoteEncryptionTypeEnum } from 'orgnote-api/remote-api';

export const NOTE_REPOSITORY_NAME = 'notes';
export const NOTE_MIGRATIONS = migrator<NoteInfo>()
  .v(1)
  .indexes('++id, meta.title, meta.description, createdAt, updatedAt, *meta.fileTags')
  .v(2)
  .indexes('++id, meta.title, meta.description, createdAt, updatedAt, *meta.fileTags, touchedAt')
  .upgrade((n) => {
    n.touchedAt = new Date().toISOString();
  })
  .v(6)
  .indexes('++id, meta.title, meta.description, createdAt, updatedAt, *meta.fileTags, touchedAt')
  .upgrade((n) => {
    n.encryptionType = n.encrypted as unknown as ModelsPublicNoteEncryptionTypeEnum;
  })
  .v(7)
  .indexes(
    '++id, meta.title, meta.description, createdAt, updatedAt, *meta.fileTags, touchedAt, filePath',
  )
  .build();

export const createNoteInfoRepository = (db: Dexie): NoteInfoRepository => {
  const storeName = 'notes';
  const store = db.table<NoteInfo, string>(storeName);

  const getNotesAfterUpdateTime = async (updatedTime?: string): Promise<NoteInfo[]> => {
    if (!updatedTime) {
      return store.filter((n) => !n.deletedAt).toArray();
    }
    return store
      .where('updatedAt')
      .above(updatedTime)
      .filter((n) => !n.deletedAt)
      .toArray();
  };

  const getDeletedNotes = async (): Promise<NoteInfo[]> => {
    return store.filter((n) => !!n.deletedAt).toArray();
  };

  const saveNotes = async (notes: NoteInfo[]): Promise<void> => {
    await store.bulkPut(notes);
  };

  const putNote = async (note: NoteInfo): Promise<void> => {
    await store.put(note);
  };

  const getById = async (id: string): Promise<NoteInfo | undefined> => {
    return store.get(id);
  };

  const getByPath = async (filePath: string[]): Promise<NoteInfo | undefined> => {
    return store
      .filter((n) => !n.deletedAt && join(...(n.filePath || [])) === join(...filePath))
      .first();
  };

  const getNotesInfo = async ({
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
  } = {}): Promise<NoteInfo[]> => {
    const collection = store
      .orderBy('touchedAt')
      .reverse()
      .filter((n) => !n.deletedAt)
      .filter((n) => searchMath(n, searchText, tags, bookmarked));

    const result: NoteInfo[] = [];
    if (limit) {
      await collection
        .offset(offset)
        .limit(limit)
        .each((n) => result.push(n));
    } else {
      await collection.each((n) => result.push(n));
    }
    return result;
  };

  const searchMath = (
    note: NoteInfo,
    searchText?: string,
    tags?: string[],
    bookmarked?: boolean,
  ): boolean => {
    if (!searchText && !tags?.length && bookmarked == null) {
      return true;
    }

    const titleMatched =
      searchText && note.meta.title?.toLowerCase().includes(searchText.toLowerCase());
    const descriptionMatched =
      searchText && note.meta.description?.toLowerCase().includes(searchText.toLowerCase());
    const tagMatched = !tags?.length || note.meta.fileTags?.some((tag) => tags.includes(tag));
    const bookmarkedMatched = bookmarked == null || note.bookmarked === bookmarked;

    return (titleMatched || descriptionMatched || !searchText) && !!tagMatched && bookmarkedMatched;
  };

  const deleteNotes = async (noteIds: string[]): Promise<void> => {
    await store.bulkDelete(noteIds);
  };

  const markAsDeleted = async (noteIds: string[]): Promise<void> => {
    await store.bulkUpdate(
      noteIds.map((id) => ({ key: id, changes: { deletedAt: new Date().toISOString() } })),
    );
  };

  const bulkPartialUpdate = async (
    updates: { id: string; changes: Partial<NoteInfo> }[],
  ): Promise<void> => {
    if (!updates.length) {
      return;
    }
    await store.bulkUpdate(updates.map(({ id, changes }) => ({ key: id, changes })));
  };

  const count = async (searchText?: string, tags?: string[]): Promise<number> => {
    return store.filter((n) => !n.deletedAt && searchMath(n, searchText, tags)).count();
  };

  const getFilePaths = async (): Promise<FilePathInfo[]> => {
    const pathInfo: FilePathInfo[] = [];
    await store
      .filter((n) => !n.deletedAt)
      .each((n) => pathInfo.push({ id: n.id, filePath: n.filePath }));
    return pathInfo;
  };

  const touchNote = async (noteId: string): Promise<void> => {
    await store.update(noteId, { touchedAt: new Date().toISOString() });
  };

  const getTagsStatistic = async (): Promise<{ tag: string; count: number }[]> => {
    const tags: { tag: string; count: number }[] = [];
    await store
      .filter((n) => !n.deletedAt)
      .each((n) => {
        n.meta.fileTags?.forEach((t) => {
          const tag = tags.find((tag) => tag.tag === t);
          if (tag) {
            tag.count++;
          } else {
            tags.push({ tag: t, count: 1 });
          }
        });
      });
    return tags.sort((a, b) => b.count - a.count);
  };

  const addBookmark = async (noteId: string): Promise<void> => {
    await store.update(noteId, { bookmarked: true });
  };

  const deleteBookmark = async (noteId: string): Promise<void> => {
    await store.update(noteId, { bookmarked: false });
  };

  const clear = async (): Promise<void> => {
    await store.clear();
  };
  const modify = async (
    modifyCallback: (note: NoteInfo, ref: { value: NoteInfo }) => void,
  ): Promise<void> => {
    await store.toCollection().modify(modifyCallback);
  };

  const getIds = async (filterCb: (n: NoteInfo) => boolean = () => true): Promise<string[]> => {
    const ids: string[] = [];
    return store
      .filter((n) => !n.deletedAt)
      .filter(filterCb)
      .each((n) => ids.push(n.id))
      .then(() => ids);
  };

  return {
    getNotesAfterUpdateTime,
    getDeletedNotes,
    saveNotes,
    putNote,
    getById,
    getByPath,
    getNotesInfo,
    deleteNotes,
    markAsDeleted,
    bulkPartialUpdate,
    count,
    getFilePaths,
    touchNote,
    getTagsStatistic,
    addBookmark,
    deleteBookmark,
    clear,
    modify,
    getIds,
  };
};
