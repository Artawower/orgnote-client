import 'fake-indexeddb/auto';
import { createFileRepository, FILE_MIGRATIONS } from './file-repository';
import type Dexie from 'dexie';
import { expect, test, beforeEach, afterEach } from 'vitest';
import { faker } from '@faker-js/faker';
import type { FileInfo } from 'orgnote-api';
import { createDatabase } from './create-database';

const createMockFile = (): FileInfo => ({
  fileName: faker.system.fileName(),
  filePath: faker.system.filePath() + `/${faker.string.uuid()}`, // Ensure unique filePath
  fileExtension: faker.system.fileExt(),
  size: faker.number.int({ min: 100, max: 10000 }),
  updatedAt: faker.date.recent(),
  createdAt: faker.date.past(),
  touchedAt: faker.date.recent(),
  backlinksPaths: Array.from({ length: 2 }, () => faker.system.filePath()),
  deletedAt: undefined,
  uploaded: faker.datatype.boolean(),
});

let repository: ReturnType<typeof createFileRepository>;
let db: Dexie;
let dropAll: () => Promise<void>;

beforeEach(async () => {
  const databaseSettings = createDatabase([{ storeName: 'files', migrations: FILE_MIGRATIONS }]);
  db = databaseSettings.db;
  dropAll = databaseSettings.dropAll;
  repository = createFileRepository(db);
});

afterEach(async () => {
  await dropAll(); // Ensure IndexedDB is cleared after each test
});

test('should upsert a file', async () => {
  const file = createMockFile();
  await repository.upsert(file);

  const result = await repository.getByPath(file.filePath);
  expect(result?.fileName).toBe(file.fileName);
});

test('should bulk upsert files', async () => {
  const files = [
    { ...createMockFile(), filePath: '/unique/path/1' },
    { ...createMockFile(), filePath: '/unique/path/2' },
  ];
  await repository.bulkUpsert(files);

  const result = await repository.getAll();
  expect(result.length).toBe(2);
});

test('should update a file', async () => {
  const file = createMockFile();
  await repository.upsert(file);
  const newFileName = 'updated_file_name';

  await repository.update(file.filePath, { fileName: newFileName });
  const result = await repository.getByPath(file.filePath);

  expect(result?.fileName).toBe(newFileName);
});

test('should delete a file', async () => {
  const file = createMockFile();
  await repository.upsert(file);
  await repository.delete(file.filePath);

  const result = await repository.getByPath(file.filePath);
  expect(result).toBeUndefined();
});

test('should search for files', async () => {
  const files = [
    { ...createMockFile(), fileName: 'important-document.txt' },
    { ...createMockFile(), fileName: 'notes.txt' },
  ];
  await repository.bulkUpsert(files);

  const result = await repository.search('important');
  expect(result.length).toBe(1);
  expect(result[0]?.fileName).toBe('important-document.txt');
});

test('should clear all files', async () => {
  const files = Array.from({ length: 2 }, createMockFile);
  await repository.bulkUpsert(files);
  await repository.clear();

  const result = await repository.getAll();
  expect(result.length).toBe(0);
});
