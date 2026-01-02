import 'fake-indexeddb/auto';
import { createFileRepository, FILE_MIGRATIONS } from './file-repository';
import type Dexie from 'dexie';
import { expect, test, beforeEach, afterEach } from 'vitest';
import { faker } from '@faker-js/faker';
import type { FileMeta } from 'orgnote-api';
import { createDatabase } from './create-database';

const createMockFile = (): FileMeta => ({
  id: faker.string.uuid(),
  filePath: [faker.system.fileName()],
  title: faker.lorem.words(3),
  description: faker.lorem.sentences(2),
  tags: Array.from({ length: 3 }, () => faker.lorem.word()),
  createdAt: faker.date.past().toISOString(),
  updatedAt: faker.date.recent().toISOString(),
  touchedAt: faker.date.recent().toISOString(),
});

let db: Dexie;
let dropAll: () => Promise<void>;
let repository: ReturnType<typeof createFileRepository>;

beforeEach(() => {
  const databaseSettings = createDatabase([
    { storeName: 'files', migrations: FILE_MIGRATIONS },
  ]);
  db = databaseSettings.db;
  dropAll = databaseSettings.dropAll;
  repository = createFileRepository(db);
});

afterEach(async () => {
  await dropAll();
});

test('should save and retrieve a file by ID', async () => {
  const file = createMockFile();
  await repository.save(file);

  const result = await repository.getById(file.id);
  expect(result).toEqual(file);
});

test('should retrieve file by path', async () => {
  const file = createMockFile();
  await repository.save(file);

  const result = await repository.getByPath(file.filePath);
  expect(result?.id).toBe(file.id);
});

test('should return undefined for non-existent ID', async () => {
  const result = await repository.getById(faker.string.uuid());
  expect(result).toBeUndefined();
});

test('should get multiple files by IDs', async () => {
  const files = Array.from({ length: 3 }, createMockFile);
  await repository.saveBulk(files);

  const ids = files.map((f) => f.id);
  const results = await repository.getByIds(ids);

  expect(results).toHaveLength(3);
});

test('should soft delete a file', async () => {
  const file = createMockFile();
  await repository.save(file);

  await repository.delete(file.id);

  const result = await repository.getById(file.id);
  expect(result).toBeUndefined();
});

test('should count files', async () => {
  const files = Array.from({ length: 5 }, createMockFile);
  await repository.saveBulk(files);

  const count = await repository.count();
  expect(count).toBe(5);
});

test('should count files with tag filter', async () => {
  const file1 = { ...createMockFile(), tags: ['tag1', 'shared'] };
  const file2 = { ...createMockFile(), tags: ['tag2', 'shared'] };
  const file3 = { ...createMockFile(), tags: ['tag1'] };

  await repository.saveBulk([file1, file2, file3]);

  const countShared = await repository.count(['shared']);
  const countTag1 = await repository.count(['tag1']);

  expect(countShared).toBe(2);
  expect(countTag1).toBe(2);
});

test('should get tags stats', async () => {
  const file1 = { ...createMockFile(), tags: ['common', 'a'] };
  const file2 = { ...createMockFile(), tags: ['common', 'b'] };
  const file3 = { ...createMockFile(), tags: ['common'] };

  await repository.saveBulk([file1, file2, file3]);

  const stats = await repository.getTagsStats();
  const commonStat = stats.find((s) => s.tag === 'common');

  expect(commonStat?.count).toBe(3);
});

test('should merge with existing on save', async () => {
  const original = createMockFile();
  original.createdAt = '2020-01-01T00:00:00.000Z';
  original.backlinks = ['link1', 'link2'];
  await repository.save(original);

  const updated: FileMeta = {
    id: 'new-id',
    filePath: original.filePath,
    title: 'Updated Title',
    updatedAt: new Date().toISOString(),
  };
  await repository.save(updated);

  const result = await repository.getByPath(original.filePath);

  expect(result?.id).toBe(original.id);
  expect(result?.createdAt).toBe(original.createdAt);
  expect(result?.backlinks).toEqual(original.backlinks);
  expect(result?.title).toBe('Updated Title');
});

test('should clear all files', async () => {
  const files = Array.from({ length: 5 }, createMockFile);
  await repository.saveBulk(files);

  await repository.clear();

  const count = await repository.count();
  expect(count).toBe(0);
});
