import { createDatabase } from './create-database';
import Dexie from 'dexie';
import { expect, test } from 'vitest';

// Mock repository
interface MockItem {
  id: number;
  name?: string;
  createdAt?: Date;
  updated?: boolean;
  migrated?: boolean;
}

const mockRepositories: {
  storeName: string;
  migrations: Record<
    string,
    { indexes: string; migrate?: (item: unknown) => void | Promise<void> }
  >;
}[] = [
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

test('should initialize schema correctly', () => {
  const { db } = createDatabase(mockRepositories);

  expect(db.verno).toBe(2); // Ensure the latest version is applied

  const schema = db.tables.map((table) => table.name);
  expect(schema).toContain('store1');
  expect(schema).toContain('store2');
});

test('should handle migrations', async () => {
  const { db } = createDatabase(mockRepositories);

  // Mock transaction and data
  const mockTx = db.transaction('rw', db.tables, async () => {
    const store1 = db.table<MockItem>('store1');
    await store1.add({ id: 1, name: 'Test Item' });
    await store1.toCollection().modify((item) => {
      const mockItem = item as MockItem;
      mockItem.updated = true;
    });

    const store2 = db.table<MockItem>('store2');
    await store2.add({ id: 2, createdAt: new Date() });
    await store2.toCollection().modify((item) => {
      const mockItem = item as MockItem;
      mockItem.migrated = true;
    });
  });

  await mockTx;

  const store1Data = await db.table<MockItem>('store1').toArray();
  const store2Data = await db.table<MockItem>('store2').toArray();

  expect(store1Data[0]?.updated).toBe(true);
  expect(store2Data[0]?.migrated).toBe(true);
});

test('should drop all data', async () => {
  const { db, dropAll } = createDatabase(mockRepositories);

  await db.table<MockItem>('store1').add({ id: 1, name: 'Test Item' });
  await dropAll();

  const tables = await Dexie.getDatabaseNames();
  expect(tables).not.toContain('orgnote');
});
