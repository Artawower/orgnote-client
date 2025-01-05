// src/infrastructure/repositories/create-database.spec.ts
import 'fake-indexeddb/auto';
import { createDatabase, MockItem } from './create-database';
import Dexie from 'dexie';
import { expect, test, beforeEach, afterEach } from 'vitest';

// Конфигурация mockRepositories
const mockRepositories = [
  {
    storeName: 'store1',
    migrations: {
      '1': {
        indexes: '++id,name',
        migrate: (item: unknown) => {
          const mockItem = item as MockItem;
          mockItem.updated = true; // Mock migration
        },
      },
    },
  },
  {
    storeName: 'store2',
    migrations: {
      '1': {
        indexes: '++id,createdAt',
      },
      '2': {
        indexes: '++id,updatedAt',
        migrate: (item: unknown) => {
          const mockItem = item as MockItem;
          mockItem.migrated = true;
        },
      },
    },
  },
];

const DATABASE_NAME = 'orgnote';

let db: Dexie;

beforeEach(async () => {
  await Dexie.delete(DATABASE_NAME);
  const dbInstance = createDatabase(mockRepositories, DATABASE_NAME);
  db = dbInstance.db;
  await db.open();
});

afterEach(async () => {
  if (db && db.isOpen()) {
    await db.close();
  }
  await Dexie.delete(DATABASE_NAME);
});

beforeEach(async () => {
  await Dexie.delete(DATABASE_NAME);

  const dbInstance = createDatabase(mockRepositories, DATABASE_NAME);
  db = dbInstance.db;
  await db.open();
});

afterEach(async () => {
  if (db && db.isOpen()) {
    await db.close();
  }
  await Dexie.delete(DATABASE_NAME);
});

// Тест: инициализация схемы
test('should initialize schema correctly', () => {
  expect(db.verno).toBe(2); // Проверяем, что применена последняя версия

  const schema = db.tables.map((table) => table.name);
  expect(schema).toContain('store1');
  expect(schema).toContain('store2');
});

// Тест: обработка миграций
test('should handle migrations', async () => {
  // Добавляем данные в store1
  const store1 = db.table<MockItem>('store1');
  await store1.add({ id: 1, name: 'Test Item' });

  // Модифицируем данные в store1
  await store1.toCollection().modify((item) => {
    const mockItem = item as MockItem;
    mockItem.updated = true;
  });

  // Добавляем данные в store2
  const store2 = db.table<MockItem>('store2');
  await store2.add({ id: 2, createdAt: new Date() });

  // Модифицируем данные в store2
  await store2.toCollection().modify((item) => {
    const mockItem = item as MockItem;
    mockItem.migrated = true;
  });

  // Проверяем изменения в store1
  const store1Data = await store1.toArray();
  expect(store1Data[0]?.updated).toBe(true);

  // Проверяем изменения в store2
  const store2Data = await store2.toArray();
  expect(store2Data[0]?.migrated).toBe(true);
});

// Тест: удаление всех данных
test('should drop all data', async () => {
  // Добавляем данные в store1
  await db.table<MockItem>('store1').add({ id: 1, name: 'Test Item' });

  // Удаляем базу данных
  const { dropAll } = createDatabase(mockRepositories, DATABASE_NAME);
  await dropAll();

  // Проверяем, что база данных удалена
  const tables = await Dexie.getDatabaseNames();
  expect(tables).not.toContain(DATABASE_NAME);
});
