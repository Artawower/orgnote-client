import 'fake-indexeddb/auto';
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { useSimpleFs } from './simple-fs';
import type { FileSystem } from 'orgnote-api';
import Dexie from 'dexie';

describe('simple-fs', () => {
  let fs: FileSystem;

  beforeEach(() => {
    fs = useSimpleFs();
  });

  afterEach(async () => {
    await Dexie.delete('simple-fs');
  });

  describe('init', () => {
    test('should create root directory on first initialization', async () => {
      const result = await fs.init?.({});

      expect(result).toEqual({ root: '/' });
      expect(await fs.isDirExist('/')).toBe(true);
    });

    test('should succeed when called multiple times (idempotent)', async () => {
      await fs.init?.({});
      const secondResult = await fs.init?.({});

      expect(secondResult).toEqual({ root: '/' });
      expect(await fs.isDirExist('/')).toBe(true);
    });

    test('should not throw ErrorDirectoryAlreadyExist on repeated init calls', async () => {
      await fs.init?.({});

      await expect(fs.init?.({})).resolves.toEqual({ root: '/' });
      await expect(fs.init?.({})).resolves.toEqual({ root: '/' });
      await expect(fs.init?.({})).resolves.toEqual({ root: '/' });
    });

    test('should preserve existing files after re-initialization', async () => {
      await fs.init?.({});
      await fs.writeFile('/test-file.txt', 'test content');

      await fs.init?.({});

      const content = await fs.readFile('/test-file.txt');
      expect(content).toBe('test content');
    });

    test('should preserve nested directory structure after re-initialization', async () => {
      await fs.init?.({});
      await fs.mkdir('/nested');
      await fs.writeFile('/nested/file.txt', 'nested content');

      await fs.init?.({});

      expect(await fs.isDirExist('/nested')).toBe(true);
      const content = await fs.readFile('/nested/file.txt');
      expect(content).toBe('nested content');
    });
  });

  describe('mkdir', () => {
    beforeEach(async () => {
      await fs.init?.({});
    });

    test('should throw error when creating directory that already exists', async () => {
      await fs.mkdir('/existing-dir');

      await expect(fs.mkdir('/existing-dir')).rejects.toThrow('Directory already exists');
    });

    test('should create new directory successfully', async () => {
      await fs.mkdir('/new-dir');

      expect(await fs.isDirExist('/new-dir')).toBe(true);
    });
  });

  describe('file operations after multiple inits', () => {
    test('should allow normal file operations after repeated init', async () => {
      await fs.init?.({});
      await fs.init?.({});
      await fs.init?.({});

      await fs.writeFile('/after-inits.txt', 'works');
      const content = await fs.readFile('/after-inits.txt');

      expect(content).toBe('works');
    });

    test('should maintain filesystem consistency through init cycles', async () => {
      await fs.init?.({});
      await fs.writeFile('/file1.txt', 'content1');

      await fs.init?.({});
      await fs.writeFile('/file2.txt', 'content2');

      await fs.init?.({});

      expect(await fs.readFile('/file1.txt')).toBe('content1');
      expect(await fs.readFile('/file2.txt')).toBe('content2');
    });
  });
});
