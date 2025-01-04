import 'fake-indexeddb/auto';
import { createNoteInfoRepository, NOTE_MIGRATIONS } from './note-info-repository';
import type Dexie from 'dexie';
import { expect, test, beforeEach, afterEach } from 'vitest';
import { faker } from '@faker-js/faker';
import type { NoteInfo } from 'orgnote-api';
import { createDatabase } from './create-database';

const createMockNote = (): NoteInfo => ({
  id: faker.string.uuid(),
  meta: {
    title: faker.lorem.words(3),
    description: faker.lorem.sentences(2),
    fileTags: Array.from({ length: 3 }, () => faker.lorem.word()),
  },
  filePath: [faker.system.filePath()],
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  touchedAt: faker.date.recent().toISOString(),
  bookmarked: faker.datatype.boolean(),
  encrypted: faker.datatype.boolean(),
  deletedAt: undefined,
});

let db: Dexie;
let dropAll: () => Promise<void>;
let repository: ReturnType<typeof createNoteInfoRepository>;

beforeEach(() => {
  const databaseSettings = createDatabase([{ storeName: 'notes', migrations: NOTE_MIGRATIONS }]);
  db = databaseSettings.db;
  dropAll = databaseSettings.dropAll;
  repository = createNoteInfoRepository(db);
});

afterEach(async () => {
  await dropAll();
});

test('should save and retrieve a note by ID', async () => {
  const note = createMockNote();
  await repository.putNote(note);

  const result = await repository.getById(note.id);
  expect(result).toEqual(note);
});

test('should retrieve notes after a specific update time', async () => {
  const recentNote = { ...createMockNote(), updatedAt: new Date().toISOString() };
  const oldNote = { ...createMockNote(), updatedAt: new Date(Date.now() - 100000).toISOString() };
  await repository.saveNotes([recentNote, oldNote]);

  const results = await repository.getNotesAfterUpdateTime(
    new Date(Date.now() - 50000).toISOString(),
  );
  expect(results).toEqual([recentNote]);
});

test('should mark notes as deleted', async () => {
  const note = createMockNote();
  await repository.putNote(note);
  await repository.markAsDeleted([note.id]);

  const deletedNotes = await repository.getDeletedNotes();
  expect(deletedNotes).toHaveLength(1);
  expect(deletedNotes[0]?.id).toBe(note.id);
});

test('should retrieve notes with specific tags', async () => {
  const noteWithTag = {
    ...createMockNote(),
    meta: { ...createMockNote().meta, fileTags: ['tag1'] },
  };
  const noteWithoutTag = {
    ...createMockNote(),
    meta: { ...createMockNote().meta, fileTags: ['tag2'] },
  };
  await repository.saveNotes([noteWithTag, noteWithoutTag]);

  const results = await repository.getNotesInfo({ tags: ['tag1'] });
  expect(results).toHaveLength(1);
  expect(results[0]?.meta.fileTags).toContain('tag1');
});

test('should add and remove a bookmark', async () => {
  const note = createMockNote();
  await repository.putNote(note);

  await repository.addBookmark(note.id);
  const bookmarkedNote = await repository.getById(note.id);
  expect(bookmarkedNote?.bookmarked).toBe(true);

  await repository.deleteBookmark(note.id);
  const unbookmarkedNote = await repository.getById(note.id);
  expect(unbookmarkedNote?.bookmarked).toBe(false);
});

test('should count notes with search criteria', async () => {
  const note = {
    ...createMockNote(),
    meta: { ...createMockNote().meta, title: 'searchable title' },
  };
  await repository.putNote(note);

  const count = await repository.count('searchable');
  expect(count).toBe(1);
});

test('should retrieve file paths', async () => {
  const note = createMockNote();
  await repository.putNote(note);

  const filePaths = await repository.getFilePaths();
  expect(filePaths).toHaveLength(1);
  expect(filePaths[0]?.filePath).toEqual(note.filePath);
});

test('should clear all notes', async () => {
  const notes = Array.from({ length: 5 }, createMockNote);
  await repository.saveNotes(notes);

  await repository.clear();
  const allNotes = await repository.getNotesAfterUpdateTime();
  expect(allNotes).toHaveLength(0);
});

test('should modify notes based on callback', async () => {
  const note = createMockNote();
  await repository.putNote(note);

  await repository.modify((n) => {
    n.meta.title = 'Modified title';
  });

  const modifiedNote = await repository.getById(note.id);
  expect(modifiedNote?.meta.title).toBe('Modified title');
});

test('should retrieve IDs of notes based on filter callback', async () => {
  const notes = Array.from({ length: 3 }, createMockNote);
  await repository.saveNotes(notes);

  const ids = await repository.getIds((n) => n.meta.fileTags?.includes(notes[0].meta.fileTags[0]));
  expect(ids).toContain(notes[0].id);
});

test('should not modify non-existing note', async () => {
  const nonExistentId = faker.string.uuid();

  await repository.modify((n) => {
    if (n.id === nonExistentId) {
      n.meta.title = 'Non-existent';
    }
  });

  const result = await repository.getById(nonExistentId);
  expect(result).toBeUndefined();
});

test('should not double delete already deleted notes', async () => {
  const note = createMockNote();
  await repository.putNote(note);
  await repository.markAsDeleted([note.id]);

  await repository.markAsDeleted([note.id]); // Повторная попытка удалить
  const deletedNotes = await repository.getDeletedNotes();

  expect(deletedNotes).toHaveLength(1);
  expect(deletedNotes[0]?.id).toBe(note.id);
});

test('should handle empty updates in bulkPartialUpdate', async () => {
  await repository.bulkPartialUpdate([]);
  const allNotes = await repository.getNotesAfterUpdateTime();
  expect(allNotes).toHaveLength(0);
});

test('should return undefined for non-existing ID', async () => {
  const nonExistentId = faker.string.uuid();
  const result = await repository.getById(nonExistentId);
  expect(result).toBeUndefined();
});

test('should handle large number of notes', async () => {
  const notes = Array.from({ length: 1000 }, createMockNote);
  await repository.saveNotes(notes);

  const count = await repository.count();
  expect(count).toBe(1000);
});

test('should clear and re-add notes successfully', async () => {
  const notes = Array.from({ length: 5 }, createMockNote);
  await repository.saveNotes(notes);

  await repository.clear();
  await repository.saveNotes(notes);

  const allNotes = await repository.getNotesAfterUpdateTime();
  expect(allNotes).toHaveLength(5);
});
