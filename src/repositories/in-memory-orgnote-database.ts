import {
  StoredExtension,
  ExtensionMeta,
  Note,
  NotePreview,
  ExtensionRepository as IExtensionRepository,
  FileRepository as IFileRepository,
  NoteRepository as INoteRepository,
  Repositories,
  FilePathInfo,
  FileCache,
} from 'orgnote-api';

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

class InMemoryNoteRepository implements INoteRepository {
  private notes: Note[] = [];

  async getNotesAfterUpdateTime(): Promise<Note[]> {
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

  async clear(): Promise<void> {
    this.notes = [];
  }

  async getById(id: string): Promise<Note> {
    const note = this.notes.find((n) => n.id === id);
    return note;
  }

  async getNotePreviews(): Promise<NotePreview[]> {
    // Implement according to options
    return [];
  }

  async deleteNotes(noteIds: string[]): Promise<void> {
    this.notes = this.notes.filter((note) => !noteIds.includes(note.id));
  }

  async markAsDeleted(): Promise<void> {}

  async getByPath(_path: string[]): Promise<Note> {
    return;
  }

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

  async count(): Promise<number> {
    // Implement according to searchText and tags
    return this.notes.length;
  }

  async getFilePaths(): Promise<FilePathInfo[]> {
    // Implement
    return [];
  }

  async touchNote(): Promise<void> {}

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

  async modify(): Promise<void> {
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
  private files: { [filePath: string]: FileCache } = {};

  async upsert(file: FileCache): Promise<void> {
    this.files[file.filePath] = file;
  }

  async bulkUpsert(files: FileCache[]): Promise<void> {
    files.forEach((file) => {
      this.files[file.filePath] = file;
    });
  }

  async update(filePath: string, file: Partial<FileCache>): Promise<void> {
    if (this.files[filePath]) {
      this.files[filePath] = { ...this.files[filePath], ...file };
    }
  }

  async delete(filePath: string): Promise<void> {
    delete this.files[filePath];
  }

  async markAsDelete(
    filePath: string,
    deletedAt: Date = new Date()
  ): Promise<void> {
    if (this.files[filePath]) {
      this.files[filePath].deletedAt = deletedAt;
    }
  }

  async clear(): Promise<void> {
    this.files = {};
  }

  async getFirstUnuploaded(): Promise<FileCache | null> {
    return Object.values(this.files).find((file) => !file.uploaded) || null;
  }

  async search(text: string): Promise<FileCache[]> {
    return Object.values(this.files).filter((file) =>
      file.fileName.includes(text)
    );
  }

  async getAll(): Promise<FileCache[]> {
    return Object.values(this.files);
  }

  async getFilesAfterUpdateTime(
    updatedTime: Date = new Date(0)
  ): Promise<FileCache[]> {
    return Object.values(this.files).filter(
      (file) => file.updatedAt && file.updatedAt > updatedTime
    );
  }

  async count(updatedTime: Date = new Date(0)): Promise<number> {
    return (await this.getFilesAfterUpdateTime(updatedTime)).length;
  }

  async getByPath(path: string): Promise<FileCache> {
    return this.files[path];
  }
}

export function initInMemoryOrgNoteRepositories(): Repositories {
  const inMemoryRepositories = {
    notes: new InMemoryNoteRepository(),
    files: new InMemoryFileRepository(),
    extensions: new InMemoryExtensionRepository(),
  };

  return inMemoryRepositories;
}
