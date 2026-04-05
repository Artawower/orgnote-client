import { test, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import clone from 'rfdc';
import { useConfigStore } from './config';
import { DEFAULT_CONFIG } from 'src/constants/config';
import type { DiskFile, FileSystem, FileSystemInfo } from 'orgnote-api';
import { useFileSystemManagerStore } from './file-system-manager';
import { useSettingsStore } from './settings';
import { stringifyToml } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';

vi.mock('src/boot/report', () => ({
  reporter: {
    reportError: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  setActivePinia(createPinia());
});

test('should initialize with default config', () => {
  const store = useConfigStore();

  expect(store.config).toEqual(clone()(DEFAULT_CONFIG));
  expect(store.configErrors).toEqual([]);
  expect(store.sync).toBeDefined();
});

test('should have config as reactive object', () => {
  const store = useConfigStore();

  expect(store.config).toBeDefined();
  expect(store.config.system).toBeDefined();
  expect(store.config.ui).toBeDefined();
});

test('should have empty config errors initially', () => {
  const store = useConfigStore();

  expect(store.configErrors).toEqual([]);
  expect(Array.isArray(store.configErrors)).toBe(true);
});

test('should have sync method', () => {
  const store = useConfigStore();

  expect(typeof store.sync).toBe('function');
});

test('config should be equal to DEFAULT_CONFIG structure', () => {
  const store = useConfigStore();
  const defaultConfig = clone()(DEFAULT_CONFIG);

  expect(store.config.system).toEqual(defaultConfig.system);
  expect(store.config.ui).toEqual(defaultConfig.ui);
});

test('should create independent store instances', () => {
  const store1 = useConfigStore();
  const store2 = useConfigStore();

  expect(store1).toBe(store2);
});

test('config should be mutable', () => {
  const store = useConfigStore();

  store.config.system.language = 'ru-RU';

  expect(store.config.system.language).toBe('ru-RU');
});

test('configErrors should be reactive array', () => {
  const store = useConfigStore();

  store.configErrors.push('Test error');

  expect(store.configErrors).toContain('Test error');
  expect(store.configErrors.length).toBe(1);
});

const createDiskFile = (path: string, mtime: number, size = 0): DiskFile => ({
  name: path.split('/').pop() ?? '',
  path,
  type: 'file',
  size,
  mtime,
});

const createMockFs = (
  configToml: string,
): { fs: FileSystem; files: Map<string, DiskFile & { content: string }> } => {
  const files = new Map<string, DiskFile & { content: string }>();
  let nextMtime = 300;

  const configPath = '/.orgnote/config.toml';
  files.set(configPath, {
    ...createDiskFile(configPath, 200, configToml.length),
    content: configToml,
  });

  const fs: FileSystem = {
    readFile: async (path) => {
      const file = files.get(path);
      if (!file) throw new Error(`Missing file: ${path}`);
      return file.content as never;
    },
    writeFile: async (path, content) => {
      const text = typeof content === 'string' ? content : new TextDecoder().decode(content);
      files.set(path, { ...createDiskFile(path, nextMtime++, text.length), content: text });
    },
    readDir: async (path) => {
      if (path !== '/.orgnote') return [];
      return [...files.values()].filter(
        (f) => f.path.startsWith('/.orgnote/') && f.path.split('/').length === 3,
      );
    },
    fileInfo: async (path) => files.get(path),
    rename: async (path, newPath) => {
      const file = files.get(path);
      if (!file) throw new Error(`Missing file: ${path}`);
      files.delete(path);
      files.set(newPath, {
        ...file,
        path: newPath,
        name: newPath.split('/').pop() ?? '',
        mtime: nextMtime++,
      });
    },
    deleteFile: async (path) => void files.delete(path),
    rmdir: async () => undefined,
    mkdir: async () => undefined,
    isDirExist: async () => true,
    isFileExist: async (path) => files.has(path),
    utimeSync: async () => undefined,
  };

  return { fs, files };
};

test('sync quarantines invalid config.toml', async () => {
  const { fs, files } = createMockFs('invalid = [toml');

  const fsInfo: FileSystemInfo = {
    name: 'mock-fs',
    fs: () => fs,
    type: 'web',
    initialVault: '/',
  };

  const settingsStore = useSettingsStore();
  settingsStore.settings.vault = '/';

  const fsManager = useFileSystemManagerStore();
  fsManager.register(fsInfo);
  fsManager.currentFsName = 'mock-fs';

  const store = useConfigStore();
  await store.sync();

  expect(files.has('/.orgnote/config-broken-1.toml')).toBe(true);
  expect(files.get('/.orgnote/config.toml')?.content).toBe(stringifyToml(clone()(DEFAULT_CONFIG)));
  expect(reporter.reportError).toHaveBeenCalled();
});

test('sync loads config.toml into store', async () => {
  const diskConfig = clone()(DEFAULT_CONFIG);
  diskConfig.system.language = 'ru-RU';

  const { fs } = createMockFs(stringifyToml(diskConfig));

  const fsInfo: FileSystemInfo = {
    name: 'mock-fs',
    fs: () => fs,
    type: 'web',
    initialVault: '/',
  };

  const settingsStore = useSettingsStore();
  settingsStore.settings.vault = '/';

  const fsManager = useFileSystemManagerStore();
  fsManager.register(fsInfo);
  fsManager.currentFsName = 'mock-fs';

  const store = useConfigStore();
  await store.sync();

  expect(store.config.system.language).toBe('ru-RU');
});

test('sync is a no-op when no filesystem selected', async () => {
  const store = useConfigStore();

  await expect(store.sync()).resolves.toBeUndefined();
  expect(reporter.reportError).not.toHaveBeenCalled();
});

test('sync with pickFolder fs but empty vault skips disk sync', async () => {
  const { fs } = createMockFs(stringifyToml(clone()(DEFAULT_CONFIG)));
  const fileInfoSpy = vi.spyOn(fs, 'fileInfo');
  const writeFileSpy = vi.spyOn(fs, 'writeFile');

  const fsInfo: FileSystemInfo = {
    name: 'mock-fs',
    fs: () => ({
      ...fs,
      pickFolder: vi.fn(async () => '/picked'),
    }),
    type: 'web',
  };

  const settingsStore = useSettingsStore();
  settingsStore.settings.vault = '';

  const fsManager = useFileSystemManagerStore();
  fsManager.register(fsInfo);
  fsManager.currentFsName = 'mock-fs';

  const store = useConfigStore();
  await store.sync();

  expect(fileInfoSpy).not.toHaveBeenCalled();
  expect(writeFileSpy).not.toHaveBeenCalled();
  expect(reporter.reportError).not.toHaveBeenCalled();
});

test('sync sets configErrors for schema-invalid config.toml', async () => {
  const { fs, files } = createMockFs('system = { language = 123 }');

  const fsInfo: FileSystemInfo = {
    name: 'mock-fs',
    fs: () => fs,
    type: 'web',
    initialVault: '/',
  };

  const settingsStore = useSettingsStore();
  settingsStore.settings.vault = '/';

  const fsManager = useFileSystemManagerStore();
  fsManager.register(fsInfo);
  fsManager.currentFsName = 'mock-fs';

  const store = useConfigStore();
  await store.sync();

  expect(files.has('/.orgnote/config-broken-1.toml')).toBe(true);
  expect(store.configErrors.length).toBeGreaterThan(0);
});
