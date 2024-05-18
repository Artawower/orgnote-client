import { StoredExtension, ExtensionMeta, Note, NotePreview } from 'orgnote-api';
import {
  IExtensionRepository,
  IFileManagerRepository,
  IFileRepository,
  INoteRepository,
  Repositories,
} from 'src/models';
import { FileTree } from './file-manager-repository';
import { FilePathInfo } from './note-repository';

class InMemoryExtensionRepository implements IExtensionRepository {
  private extensions: StoredExtension[] = [];

  async getMeta(): Promise<ExtensionMeta[]> {
    return [];
  }

  async getActiveExtensions(): Promise<StoredExtension[]> {
    return this.extensions.filter((extension) => extension.active);
  }

  async setActiveStatus(extensionName: string, active: boolean): Promise<void> {
    const extension = this.extensions.find(
      (ext) => ext.manifest.name === extensionName
    );
    if (extension) {
      extension.active = active;
    }
  }

  async activateExtension(extensionName: string): Promise<void> {
    await this.setActiveStatus(extensionName, true);
  }

  async deactivateExtension(extensionName: string): Promise<void> {
    await this.setActiveStatus(extensionName, false);
  }

  async upsertExtensions(extensions: StoredExtension[]): Promise<void> {
    extensions.forEach((ext) => {
      const existingIndex = this.extensions.findIndex(
        (existing) => existing.manifest.name === ext.manifest.name
      );
      if (existingIndex !== -1) {
        this.extensions[existingIndex] = ext;
      } else {
        this.extensions.push(ext);
      }
    });
  }

  async getExtension(extensionName: string): Promise<StoredExtension> {
    return this.extensions.find((ext) => ext.manifest.name === extensionName);
  }

  async getExtensionBySource(source: string): Promise<StoredExtension> {
    return this.extensions.find((ext) => ext.manifest.sourceType === source);
  }

  async deleteBySource(source: string): Promise<void> {
    this.extensions = this.extensions.filter(
      (ext) => ext.manifest.sourceType !== source
    );
  }

  async delete(extensionName: string): Promise<void> {
    this.extensions = this.extensions.filter(
      (ext) => ext.manifest.name !== extensionName
    );
  }
}

class InMemoryFileManagerRepository implements IFileManagerRepository {
  private fileTree: FileTree = {};

  async getAll(): Promise<FileTree> {
    return this.fileTree;
  }

  async upsert(fileTree: FileTree): Promise<void> {
    this.fileTree = fileTree;
  }
}

class InMemoryNoteRepository implements INoteRepository {
  private notes: Note[] = [];

  async getNotesAfterUpdateTime(_updatedTime?: string): Promise<Note[]> {
    return [];
  }

  async getDeletedNotes(): Promise<Note[]> {
    return this.notes.filter((note) => note.deleted);
  }

  async saveNotes(notes: Note[]): Promise<void> {
    this.notes.push(...notes);
  }

  async putNote(note: Note): Promise<void> {
    const index = this.notes.findIndex((n) => n.id === note.id);
    if (index !== -1) {
      this.notes[index] = note;
    } else {
      this.notes.push(note);
    }
  }

  async getById(id: string): Promise<Note> {
    const note = this.notes.find((n) => n.id === id);
    if (!note) {
      throw new Error(`Note with ID ${id} not found`);
    }
    return note;
  }

  async getNotePreviews(_options?: {
    limit?: number;
    offset?: number;
    searchText?: string;
    tags?: string[];
    bookmarked?: boolean;
  }): Promise<NotePreview[]> {
    // Implement according to options
    return [];
  }

  async deleteNotes(noteIds: string[]): Promise<void> {
    this.notes = this.notes.filter((note) => !noteIds.includes(note.id));
  }

  async markAsDeleted(_noteIds: string[]): Promise<void> {}

  async bulkPartialUpdate(
    updates: { id: string; changes: Partial<Note> }[]
  ): Promise<void> {
    updates.forEach((update) => {
      const note = this.notes.find((n) => n.id === update.id);
      if (note) {
        Object.assign(note, update.changes);
      }
    });
  }

  async count(searchText?: string, tags?: string[]): Promise<number> {
    // Implement according to searchText and tags
    return this.notes.length;
  }

  async getFilePaths(): Promise<FilePathInfo[]> {
    // Implement
    return [];
  }

  async touchNote(noteId: string): Promise<void> {}

  async getTagsStatistic(): Promise<{ tag: string; count: number }[]> {
    // Implement
    return [];
  }

  async addBookmark(noteId: string): Promise<void> {
    const note = this.notes.find((n) => n.id === noteId);
    if (note) {
      note.bookmarked = true;
    }
  }

  async deleteBookmark(noteId: string): Promise<void> {
    const note = this.notes.find((n) => n.id === noteId);
    if (note) {
      note.bookmarked = false;
    }
  }

  async modify(
    modifyCallback: (note: Note, ref: { value: Note }) => void
  ): Promise<void> {
    // Implement according to callback
  }

  async getIds(filterCb?: (n: Note) => boolean): Promise<string[]> {
    if (filterCb) {
      return this.notes.filter(filterCb).map((n) => n.id);
    }
    return this.notes.map((n) => n.id);
  }
}

class InMemoryFileRepository implements IFileRepository {
  private files: { [name: string]: File } = {};

  async save(file: File): Promise<void> {
    this.files[file.name] = file;
  }

  async deleteByName(name: string): Promise<void> {
    delete this.files[name];
  }

  async getByName(name: string): Promise<File> {
    const file = this.files[name];
    if (!file) {
      throw new Error(`File ${name} not found`);
    }
    return file;
  }

  async getFirst(): Promise<File | null> {
    const fileNames = Object.keys(this.files);
    if (fileNames.length > 0) {
      return this.files[fileNames[0]];
    }
    return null;
  }
}

export function initInMemoryOrgNoteRepositories(): Repositories {
  const inMemoryRepositories = {
    notes: new InMemoryNoteRepository(),
    fileManager: new InMemoryFileManagerRepository(),
    files: new InMemoryFileRepository(),
    extensions: new InMemoryExtensionRepository(),
  };

  return inMemoryRepositories;
}
