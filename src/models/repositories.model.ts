import { ExtensionMeta, Note, NotePreview, StoredExtension } from 'orgnote-api';
import { FilePathInfo } from 'src/repositories';

// TODO: move to API package
export interface IExtensionRepository {
  getMeta(): Promise<ExtensionMeta[]>;
  getActiveExtensions(): Promise<StoredExtension[]>;
  setActiveStatus(extensionName: string, active: boolean): Promise<void>;
  activateExtension(extensionName: string): Promise<void>;
  deactivateExtension(extensionName: string): Promise<void>;
  upsertExtensions(extensions: StoredExtension[]): Promise<void>;
  getExtension(extensionName: string): Promise<StoredExtension>;
  getExtensionBySource(source: string): Promise<StoredExtension>;
  deleteBySource(source: string): Promise<void>;
  delete(extensionName: string): Promise<void>;
}

export interface IFileRepository {
  save(file: File): Promise<void>;
  deleteByName(name: string): Promise<void>;
  getByName(name: string): Promise<File>;
  getFirst(): Promise<File | null>;
}

export interface INoteRepository {
  getNotesAfterUpdateTime(updatedTime?: string): Promise<Note[]>;
  getDeletedNotes(): Promise<Note[]>;
  saveNotes(notes: Note[]): Promise<void>;
  putNote(note: Note): Promise<void>;
  getById(id: string): Promise<Note>;
  getByPath(path: string[]): Promise<Note>;
  getNotePreviews(options?: {
    limit?: number;
    offset?: number;
    searchText?: string;
    tags?: string[];
    bookmarked?: boolean;
  }): Promise<NotePreview[]>;
  deleteNotes(noteIds: string[]): Promise<void>;
  markAsDeleted(noteIds: string[]): Promise<void>;
  bulkPartialUpdate(
    updates: { id: string; changes: Partial<Note> }[]
  ): Promise<void>;
  count(searchText?: string, tags?: string[]): Promise<number>;
  getFilePaths(): Promise<FilePathInfo[]>;
  touchNote(noteId: string): Promise<void>;
  getTagsStatistic(): Promise<{ tag: string; count: number }[]>;
  addBookmark(noteId: string): Promise<void>;
  deleteBookmark(noteId: string): Promise<void>;
  modify(
    modifyCallback: (note: Note, ref: { value: Note }) => void
  ): Promise<void>;
  getIds(filterCb?: (n: Note) => boolean): Promise<string[]>;
  clear(): Promise<void>;
}

export interface Repositories {
  notes: INoteRepository;
  files: IFileRepository;
  extensions: IExtensionRepository;
}
