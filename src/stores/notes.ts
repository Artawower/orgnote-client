import { useCurrentNoteStore } from './current-note';
import { useGraphStore } from './graph';
import { useSyncStore } from './sync';
import { defineStore } from 'pinia';
import { sdk } from 'src/boot/axios';
import { HandlersCreatingNote } from 'src/generated/api';
import { toDeepRaw } from 'src/tools';

import { ref } from 'vue';
import { repositories } from 'src/boot/repositories';
import {
  NotePreview,
  NotesFilter,
  Note,
  findNoteFilesDiff,
  StoredNoteInfo,
  NoteChange,
  orgnodeToNote,
  isGpgEncrypted,
  splitPath,
  isOrgGpgFile,
} from 'orgnote-api';
import {
  FILE_SYSTEM_MUTATION_ACTIONS,
  useFileSystemStore,
} from './file-system.store';
import { parse, withMetaInfo } from 'org-mode-ast';
import { onMounted } from 'vue';
import { v4 } from 'uuid';
import { useEncryptionErrorHandler } from 'src/hooks/use-encryption-error-handler';

export const DEFAULT_LIMIT = 20;
export const DEFAULT_OFFSET = 0;

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<NotePreview[]>([]);

  const filters = ref<NotesFilter>({
    limit: DEFAULT_LIMIT,
    offset: DEFAULT_OFFSET,
  });
  const total = ref<number>(0);

  const syncStore = useSyncStore();
  const graphStore = useGraphStore();
  const currentNoteStore = useCurrentNoteStore();
  const fileSystemStore = useFileSystemStore();
  const notesStore = useNotesStore();

  onMounted(() => {
    watchFileSystemChanges();
  });

  const watchFileSystemChanges = () => {
    fileSystemStore.$onAction(({ after, name }) => {
      if (!FILE_SYSTEM_MUTATION_ACTIONS.includes(name)) {
        return;
      }
      after(() => notesStore.syncWithFs());
    });
  };

  const setFilters = (filter: Partial<NotesFilter>) => {
    const updatedFilters = { ...filters.value, ...filter };
    updatedFilters.searchText = updatedFilters.searchText?.trim();
    updatedFilters.limit ||= DEFAULT_LIMIT;
    updatedFilters.offset ||= DEFAULT_OFFSET;
    filters.value = updatedFilters;
  };

  const deleteNotes = async (noteIds: string[]) => {
    await repositories.notes.deleteNotes(noteIds);
    notes.value = notes.value.filter((n) => !noteIds.includes(n.id));
    await loadNotes();
  };

  const markAsDeleted = async (noteIds: string[]) => {
    await repositories.notes.markAsDeleted(noteIds);
  };

  const upsertNotes = async (notes: Note[]) => {
    await repositories.notes.saveNotes(notes);
    loadNotes();
  };

  const upsertNotesLocally = async (notes: Note[]) => {
    await upsertNotes(notes);
    await syncStore.markToSync();
    graphStore.rebuildGraph();
  };

  const bulkPathNotesLocally = async (
    updates: { id: string; changes: Partial<Note> }[]
  ) => {
    await repositories.notes.bulkPartialUpdate(toDeepRaw(updates));
    notes.value = notes.value.map((n) => {
      const changedNote = updates.find((cn) => cn.id === n.id);
      if (changedNote) {
        return {
          ...n,
          ...changedNote.changes,
          updateAt: new Date().toISOString(),
        };
      }
      return n;
    });
    await syncStore.markToSync();
  };

  const fetchNotes = async (offset: number, limit: number) => {
    if (!!filters.value.offset && filters.value.offset === offset) {
      return;
    }

    setFilters({ offset });
    const data = await repositories.notes.getNotePreviews({
      limit,
      offset,
      searchText: filters.value.searchText,
    });
    // TODO: master optimize. Do nothing when notes already loaded
    const indexedNotes = [...notes.value];
    data.forEach((v, i) => {
      indexedNotes[i + offset] = v;
    });
    notes.value = indexedNotes;
  };

  const createNote = async (note: HandlersCreatingNote) => {
    try {
      await sdk.notes.notesPost(note);
      loadNotes();
      syncStore.markToSync();
    } catch (e) {
      // TODO: master handle error
      console.log('✎: [line 68][notes.ts] e: ', e);
    }
  };

  const loadNotes = async () => {
    notes.value = await repositories.notes.getNotePreviews({
      limit: filters.value.limit,
      offset: filters.value.offset,
    });
    total.value = await repositories.notes.count();
  };

  const loadTotal = async () => {
    total.value = await repositories.notes.count();
  };

  const toggleBookmark = async (note: NotePreview | Note) => {
    if (note.bookmarked) {
      await repositories.notes.deleteBookmark(note.id);
    } else {
      await repositories.notes.addBookmark(note.id);
    }

    if (currentNoteStore.currentNote?.id === note.id) {
      currentNoteStore.updateCurrentNotePartially({
        bookmarked: !note.bookmarked,
      });
    }

    notes.value = notes.value.map((n) => {
      if (n.id === note.id) {
        return { ...n, bookmarked: !n.bookmarked };
      }
      return n;
    });
  };

  const resetCache = () => {
    notes.value = [];
  };

  const clearNotes = async () => {
    return await repositories.notes.clear();
  };

  const removeAllNotes = async () => {
    // TODO: master global loader here. Block the app!
    await sdk.notes.allNotesDelete();
    await repositories.notes.clear();
  };

  // TODO: debounce
  const syncWithFs = async () => {
    const cachedNotesFromLatestSync =
      (await repositories.notes.getNotesAfterUpdateTime()) as StoredNoteInfo[];

    const noteFilesDiff = await findNoteFilesDiff({
      fileInfo: fileSystemStore.fileInfo,
      dirPath: '',
      storedNotesInfo: cachedNotesFromLatestSync,
      readDir: fileSystemStore.readDir,
    });

    await markAsDeleted(noteFilesDiff.deleted.map((d) => d.id));
    await updateNotesCache([
      ...noteFilesDiff.created,
      ...noteFilesDiff.updated,
    ]);
  };

  const updateNotesCache = async (noteChanges: NoteChange[]) => {
    for (const nc of noteChanges) {
      await updateNoteCache(nc.filePath);
    }
  };

  const encryptionErrorHandler = useEncryptionErrorHandler();
  const updateNoteCache = async (filePath: string): Promise<void> => {
    try {
      const note = await getUpdatedNoteByFilePath(filePath);
      const updatedAt = new Date().toISOString();
      // NOTE: This apporach mark note as unsynced for remote API
      // cause file moving does not update utime
      note.encrypted = isOrgGpgFile(filePath);
      note.updatedAt = updatedAt;
      note.touchedAt = updatedAt;

      await upsertNotes([note]);
    } catch (e) {
      encryptionErrorHandler.handleError(e);
      console.warn(e);
    }
  };

  const getUpdatedNoteByFilePath = async (filePath: string): Promise<Note> => {
    const noteContent = await fileSystemStore.readTextFile(filePath);

    if (isGpgEncrypted(noteContent)) {
      const note: Note = {
        id: v4(),
        filePath: splitPath(filePath),
        meta: {},
        isMy: true,
      };

      return note;
    }

    const fileInfo = await fileSystemStore.fileInfo(filePath);
    const parsedNote = withMetaInfo(parse(noteContent));
    const note = orgnodeToNote(parsedNote, fileInfo);
    return note;
  };

  return {
    notes,
    total,
    filters,
    markAsDeleted,

    loadNotes,
    loadTotal,
    deleteNotes,
    fetchNotes,
    setFilters,
    createNote,
    upsertNotes,
    upsertNotesLocally,
    bulkPathNotesLocally,
    toggleBookmark,
    resetCache,
    clearNotes,
    removeAllNotes,
    syncWithFs,
  };
});
