import { expect, test, vi } from 'vitest';
import type { FileSystem, LocalFile } from 'orgnote-api';
import { createSyncExecutor } from './sync-executor';

const mocks = vi.hoisted(() => ({
  syncFilesPut: vi.fn(async () => ({
    data: {
      data: {
        version: 2,
      },
    },
  })),
}));

vi.mock('src/boot/axios', () => ({
  sdk: {
    sync: {
      syncFilesPut: mocks.syncFilesPut,
      syncFilesGet: vi.fn(),
      syncFilesDelete: vi.fn(),
    },
  },
}));

const createFileSystem = (content: Uint8Array): FileSystem =>
  ({
    readFile: vi.fn(async () => content),
  }) as unknown as FileSystem;

const createLocalFile = (): LocalFile => ({
  path: '/agenda/inbox.org',
  mtime: 1,
  size: 3,
  contentHash: 'stale-plan-hash',
});

test('createSyncExecutor upload sends hash for the uploaded bytes', async () => {
  const content = new TextEncoder().encode('abc');
  const fs = createFileSystem(content);
  const executor = createSyncExecutor(fs);

  await executor.upload(createLocalFile(), 1);

  expect(mocks.syncFilesPut).toHaveBeenCalledWith(
    '/agenda/inbox.org',
    expect.any(File),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    1,
  );
});
