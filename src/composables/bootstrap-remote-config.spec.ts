import { beforeEach, expect, test, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import clone from 'rfdc';
import type { DiskFile, FileSystem, FileSystemInfo } from 'orgnote-api';
import { stringifyToml } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';
import { DEFAULT_CONFIG } from 'src/constants/config';
import { useConfigStore } from 'src/stores/config';
import { useFileSystemManagerStore } from 'src/stores/file-system-manager';
import { useSettingsStore } from 'src/stores/settings';
import { bootstrapRemoteConfig } from './bootstrap-remote-config';

const { syncFilesGetMock } = vi.hoisted(() => ({
  syncFilesGetMock: vi.fn(),
}));

vi.mock('src/boot/axios', () => ({
  sdk: {
    sync: {
      syncFilesGet: syncFilesGetMock,
    },
  },
}));

vi.mock('src/boot/report', () => ({
  reporter: {
    reportError: vi.fn(),
  },
}));

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

const setupFs = (fs: FileSystem): void => {
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
};

beforeEach(() => {
  vi.clearAllMocks();
  syncFilesGetMock.mockReset();
  setActivePinia(createPinia());
});

test('bootstrapRemoteConfig replaces default config with remote config', async () => {
  const { fs, files } = createMockFs(stringifyToml(clone()(DEFAULT_CONFIG)));
  const remoteConfig = clone()(DEFAULT_CONFIG);
  remoteConfig.system.language = 'ru-RU';

  syncFilesGetMock.mockResolvedValue({
    data: new TextEncoder().encode(stringifyToml(remoteConfig)).buffer,
  });

  setupFs(fs);
  useConfigStore();

  await bootstrapRemoteConfig();

  expect(syncFilesGetMock).toHaveBeenCalledWith('/.orgnote/config.toml', {
    responseType: 'arraybuffer',
  });
  expect(useConfigStore().config.system.language).toBe('ru-RU');
  expect(files.get('/.orgnote/config.toml')?.content).toBe(stringifyToml(remoteConfig));
});

test('bootstrapRemoteConfig keeps local default config when remote config is missing', async () => {
  const { fs, files } = createMockFs(stringifyToml(clone()(DEFAULT_CONFIG)));
  const notFoundError = Object.assign(new Error('Not Found'), {
    isAxiosError: true,
    response: { status: 404 },
  });

  syncFilesGetMock.mockRejectedValue(notFoundError);

  setupFs(fs);
  useConfigStore();

  await bootstrapRemoteConfig();

  expect(useConfigStore().config.system.language).toBe(DEFAULT_CONFIG.system.language);
  expect(files.get('/.orgnote/config.toml')?.content).toBe(stringifyToml(clone()(DEFAULT_CONFIG)));
  expect(reporter.reportError).not.toHaveBeenCalled();
});

test('bootstrapRemoteConfig preserves user-modified local config', async () => {
  const diskConfig = clone()(DEFAULT_CONFIG);
  diskConfig.system.language = 'de-DE';

  const { fs, files } = createMockFs(stringifyToml(diskConfig));

  setupFs(fs);
  useConfigStore();

  await bootstrapRemoteConfig();

  expect(syncFilesGetMock).not.toHaveBeenCalled();
  expect(useConfigStore().config.system.language).toBe('de-DE');
  expect(files.get('/.orgnote/config.toml')?.content).toBe(stringifyToml(diskConfig));
});
