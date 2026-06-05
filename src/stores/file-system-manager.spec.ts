import { createPinia, setActivePinia } from 'pinia';
import { useFileSystemManagerStore, useFileSystemRootConfigurator } from './file-system-manager';
import { expect, test, vi, beforeEach } from 'vitest';
import type { FileSystem, FileSystemInfo } from 'orgnote-api';
import { useSettingsStore } from './settings';
import { toRaw } from 'vue';

const mockFileSystemInstance = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  readDir: vi.fn(),
  fileInfo: vi.fn(),
  rename: vi.fn(),
  deleteFile: vi.fn(),
  rmdir: vi.fn(),
  mkdir: vi.fn(),
  isDirExist: vi.fn(),
  isFileExist: vi.fn(),
  utimeSync: vi.fn(),
};

const mockFileSystemInfo: FileSystemInfo = {
  name: 'mockFs',
  fs: () => mockFileSystemInstance, // Always return the same instance
  type: 'desktop',
};

beforeEach(() => {
  const pinia = createPinia();
  setActivePinia(pinia);
});

test('initial state of the store is correct', () => {
  const store = useFileSystemManagerStore();
  expect(store.currentFsName).toBe('');
  expect(store.fileSystems).toEqual([]);
  expect(store.currentFs).toBeUndefined();
});

test('registering a new file system works correctly', () => {
  const store = useFileSystemManagerStore();
  store.register(mockFileSystemInfo);

  expect(store.fileSystems).toContainEqual(mockFileSystemInfo);
});

test('setting currentFsName updates currentFs correctly', () => {
  const store = useFileSystemManagerStore();
  store.register(mockFileSystemInfo);
  store.currentFsName = 'mockFs';

  expect(store.currentFsName).toBe('mockFs');
  expect(store.currentFs).toEqual(mockFileSystemInfo.fs());
});

test('computed properties are updated correctly after registration and setting currentFsName', () => {
  const store = useFileSystemManagerStore();
  store.register(mockFileSystemInfo);
  store.currentFsName = 'mockFs';

  expect(store.fileSystems).toEqual([mockFileSystemInfo]);
  expect(store.currentFs).toEqual(mockFileSystemInfo.fs());
});

test('registering a file system with a duplicate name overwrites the existing one', () => {
  const store = useFileSystemManagerStore();
  store.register(mockFileSystemInfo);

  const duplicateFileSystemInfo: FileSystemInfo = {
    name: 'mockFs',
    fs: () => ({
      readFile: vi.fn(),
      writeFile: vi.fn(),
      readDir: vi.fn(),
      fileInfo: vi.fn(),
      rename: vi.fn(),
      deleteFile: vi.fn(),
      rmdir: vi.fn(),
      mkdir: vi.fn(),
      isDirExist: vi.fn(),
      isFileExist: vi.fn(),
      utimeSync: vi.fn(),
    }),
    type: 'web',
  };

  store.register(duplicateFileSystemInfo);

  expect(store.fileSystems).toContainEqual(duplicateFileSystemInfo);
  expect(store.fileSystems).not.toContainEqual(mockFileSystemInfo);
});

test('setting currentFsName to a non-existent file system results in undefined currentFs', () => {
  const store = useFileSystemManagerStore();
  store.register(mockFileSystemInfo);
  store.currentFsName = 'nonExistentFs';

  expect(store.currentFsName).toBe('nonExistentFs');
  expect(store.currentFs).toBeUndefined();
});

test('computed properties are correct when no file systems are registered', () => {
  const store = useFileSystemManagerStore();
  store.currentFsName = '';

  expect(store.fileSystems).toEqual([]);
  expect(store.currentFs).toBeUndefined();
});

test('registering a file system with invalid properties still adds it to the store', () => {
  const store = useFileSystemManagerStore();
  const invalidFileSystemInfo = {
    name: 'invalidFs',
    fs: {
      readFile: vi.fn(),
    },
  } as unknown as FileSystemInfo;

  store.register(invalidFileSystemInfo);

  expect(store.fileSystems).toContainEqual(invalidFileSystemInfo);
});

test('setting currentFsName to an empty string results in undefined currentFs', () => {
  const store = useFileSystemManagerStore();
  store.register(mockFileSystemInfo);
  store.currentFsName = 'mockFs';
  store.currentFsName = '';

  expect(store.currentFsName).toBe('');
  expect(store.currentFs).toBeUndefined();
});

test('useFs with non-existent fsName does nothing', async () => {
  const store = useFileSystemManagerStore();
  const initSpy = vi.fn(async () => undefined);

  const fsInfo: FileSystemInfo = {
    name: 'existing-fs',
    fs: () => ({
      readFile: createReadFile(),
      writeFile: vi.fn(async () => undefined),
      readDir: vi.fn(async () => []),
      fileInfo: vi.fn(async () => undefined),
      rename: vi.fn(async () => undefined),
      deleteFile: vi.fn(async () => undefined),
      rmdir: vi.fn(async () => undefined),
      mkdir: vi.fn(async () => undefined),
      isDirExist: vi.fn(async () => true),
      isFileExist: vi.fn(async () => true),
      utimeSync: vi.fn(async () => undefined),
      init: initSpy,
      mount: vi.fn(async () => true),
    }),
    type: 'web',
  };

  store.register(fsInfo);

  const settingsStore = useSettingsStore();
  settingsStore.settings.vault = '/';

  await store.useFs('missing-fs');

  expect(initSpy).not.toHaveBeenCalled();
  expect(store.currentFsName).toBe('');
  expect(store.currentFs).toBeUndefined();
  expect(settingsStore.settings.vault).toBe('/');
});

const createDeferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const createReadFile = (): FileSystem['readFile'] => {
  const readFile: FileSystem['readFile'] = async (_path, encoding) => {
    if (encoding === 'binary') {
      return new Uint8Array() as never;
    }
    return '' as never;
  };
  return readFile;
};

const createMinimalFs = (initPromise: Promise<{ root: string }>): FileSystem => ({
  readFile: createReadFile(),
  writeFile: vi.fn(async () => undefined),
  readDir: vi.fn(async () => []),
  fileInfo: vi.fn(async () => undefined),
  rename: vi.fn(async () => undefined),
  deleteFile: vi.fn(async () => undefined),
  rmdir: vi.fn(async () => undefined),
  mkdir: vi.fn(async () => undefined),
  isDirExist: vi.fn(async () => true),
  isFileExist: vi.fn(async () => true),
  utimeSync: vi.fn(async () => undefined),
  init: vi.fn(async () => await initPromise),
  mount: vi.fn(async () => true),
});

test('useFs updates desired fs before runtime mount resolves', async () => {
  const initGate = createDeferred<{ root: string }>();
  const created: FileSystem[] = [];

  const fsInfo: FileSystemInfo = {
    name: 'gated-fs',
    fs: () => {
      const fs = createMinimalFs(initGate.promise);
      created.push(fs);
      return fs;
    },
    type: 'web',
  };

  const store = useFileSystemManagerStore();
  store.register(fsInfo);

  const settingsStore = useSettingsStore();
  settingsStore.settings.vault = '';

  const pending = store.useFs('gated-fs');

  await Promise.resolve();
  expect(store.currentFsName).toBe('gated-fs');
  expect(store.fsMounted).toBe(false);

  initGate.resolve({ root: '/picked' });
  await pending;

  expect(store.currentFsName).toBe('gated-fs');
  expect(store.fsMounted).toBe(true);
});

test('currentFs uses the same initialized FS instance', async () => {
  const initGate = createDeferred<{ root: string }>();
  const created: FileSystem[] = [];

  const fsInfo: FileSystemInfo = {
    name: 'unstable-fs-factory',
    fs: () => {
      const fs = createMinimalFs(initGate.promise);
      created.push(fs);
      return fs;
    },
    type: 'web',
  };

  const store = useFileSystemManagerStore();
  store.register(fsInfo);

  initGate.resolve({ root: '/picked' });
  await store.useFs('unstable-fs-factory');

  expect(created.length).toBe(1);
  expect(toRaw(store.currentFs)).toBe(created[0]);
});

test('useFs does not reinitialize when selecting the same filesystem', async () => {
  const initSpy = vi.fn(async () => ({ root: '/' }));

  const fsInfo: FileSystemInfo = {
    name: 'tracked-fs',
    fs: () => ({
      readFile: createReadFile(),
      writeFile: vi.fn(async () => undefined),
      readDir: vi.fn(async () => []),
      fileInfo: vi.fn(async () => undefined),
      rename: vi.fn(async () => undefined),
      deleteFile: vi.fn(async () => undefined),
      rmdir: vi.fn(async () => undefined),
      mkdir: vi.fn(async () => undefined),
      isDirExist: vi.fn(async () => true),
      isFileExist: vi.fn(async () => true),
      utimeSync: vi.fn(async () => undefined),
      init: initSpy,
      mount: vi.fn(async () => true),
    }),
    type: 'web',
  };

  const store = useFileSystemManagerStore();
  store.register(fsInfo);

  await store.useFs('tracked-fs');
  expect(initSpy).toHaveBeenCalledTimes(1);

  await store.useFs('tracked-fs');
  await store.useFs('tracked-fs');
  await store.useFs('tracked-fs');

  expect(initSpy).toHaveBeenCalledTimes(1);
});

test('useFs remounts active filesystem when desired vault changed', async () => {
  const initSpy = vi.fn(async () => ({ root: '/vault' }));

  const fsInfo: FileSystemInfo = {
    name: 'already-active-fs',
    fs: () => ({
      readFile: createReadFile(),
      writeFile: vi.fn(async () => undefined),
      readDir: vi.fn(async () => []),
      fileInfo: vi.fn(async () => undefined),
      rename: vi.fn(async () => undefined),
      deleteFile: vi.fn(async () => undefined),
      rmdir: vi.fn(async () => undefined),
      mkdir: vi.fn(async () => undefined),
      isDirExist: vi.fn(async () => true),
      isFileExist: vi.fn(async () => true),
      utimeSync: vi.fn(async () => undefined),
      init: initSpy,
      mount: vi.fn(async () => true),
    }),
    type: 'web',
  };

  const store = useFileSystemManagerStore();
  store.register(fsInfo);

  const settingsStore = useSettingsStore();
  settingsStore.settings.vault = '/initial';

  await store.useFs('already-active-fs');

  expect(store.currentFsName).toBe('already-active-fs');
  expect(settingsStore.settings.vault).toBe('/vault');
  expect(initSpy).toHaveBeenCalledTimes(1);

  settingsStore.settings.vault = '/should-remount';

  await store.useFs('already-active-fs');

  expect(initSpy).toHaveBeenCalledTimes(2);
  expect(settingsStore.settings.vault).toBe('/vault');
});

test('useFs allows switching between different filesystems', async () => {
  const initSpyA = vi.fn(async () => ({ root: '/a' }));
  const initSpyB = vi.fn(async () => ({ root: '/b' }));

  const fsInfoA: FileSystemInfo = {
    name: 'fs-a',
    fs: () => ({
      readFile: createReadFile(),
      writeFile: vi.fn(async () => undefined),
      readDir: vi.fn(async () => []),
      fileInfo: vi.fn(async () => undefined),
      rename: vi.fn(async () => undefined),
      deleteFile: vi.fn(async () => undefined),
      rmdir: vi.fn(async () => undefined),
      mkdir: vi.fn(async () => undefined),
      isDirExist: vi.fn(async () => true),
      isFileExist: vi.fn(async () => true),
      utimeSync: vi.fn(async () => undefined),
      init: initSpyA,
      mount: vi.fn(async () => true),
    }),
    type: 'web',
  };

  const fsInfoB: FileSystemInfo = {
    name: 'fs-b',
    fs: () => ({
      readFile: createReadFile(),
      writeFile: vi.fn(async () => undefined),
      readDir: vi.fn(async () => []),
      fileInfo: vi.fn(async () => undefined),
      rename: vi.fn(async () => undefined),
      deleteFile: vi.fn(async () => undefined),
      rmdir: vi.fn(async () => undefined),
      mkdir: vi.fn(async () => undefined),
      isDirExist: vi.fn(async () => true),
      isFileExist: vi.fn(async () => true),
      utimeSync: vi.fn(async () => undefined),
      init: initSpyB,
      mount: vi.fn(async () => true),
    }),
    type: 'desktop',
  };

  const store = useFileSystemManagerStore();
  store.register(fsInfoA);
  store.register(fsInfoB);

  await store.useFs('fs-a');
  expect(store.currentFsName).toBe('fs-a');
  expect(initSpyA).toHaveBeenCalledTimes(1);
  expect(initSpyB).toHaveBeenCalledTimes(0);

  await store.useFs('fs-b');
  expect(store.currentFsName).toBe('fs-b');
  expect(initSpyA).toHaveBeenCalledTimes(1);
  expect(initSpyB).toHaveBeenCalledTimes(1);

  await store.useFs('fs-a');
  expect(store.currentFsName).toBe('fs-a');
  expect(initSpyA).toHaveBeenCalledTimes(2);
  expect(initSpyB).toHaveBeenCalledTimes(1);
});

test('reconfigureCurrentFs stores picked root and remounts current filesystem', async () => {
  const mountSpy = vi.fn(async () => true);
  const pickFolderSpy = vi.fn(async () => '/picked-root');

  const fsInfo: FileSystemInfo = {
    name: 'pickable-fs',
    fs: () => ({
      readFile: createReadFile(),
      writeFile: vi.fn(async () => undefined),
      readDir: vi.fn(async () => []),
      fileInfo: vi.fn(async () => undefined),
      rename: vi.fn(async () => undefined),
      deleteFile: vi.fn(async () => undefined),
      rmdir: vi.fn(async () => undefined),
      mkdir: vi.fn(async () => undefined),
      isDirExist: vi.fn(async () => true),
      isFileExist: vi.fn(async () => true),
      utimeSync: vi.fn(async () => undefined),
      init: vi.fn(async (params) => params),
      mount: mountSpy,
      pickFolder: pickFolderSpy,
    }),
    type: 'desktop',
  };

  const store = useFileSystemManagerStore();
  store.register(fsInfo);
  await store.useFs('pickable-fs');

  await useFileSystemRootConfigurator().reconfigureCurrentFs();

  const settingsStore = useSettingsStore();
  expect(pickFolderSpy).toHaveBeenCalledTimes(1);
  expect(settingsStore.settings.vault).toBe('/picked-root');
  expect(mountSpy).toHaveBeenLastCalledWith({ root: '/picked-root' });
});

test('useFs ignores stale init result after filesystem switch', async () => {
  const initGateA = createDeferred<{ root: string }>();
  const mountSpyA = vi.fn(async () => true);
  const mountSpyB = vi.fn(async () => true);

  const fsInfoA: FileSystemInfo = {
    name: 'stale-fs-a',
    fs: () => ({
      readFile: createReadFile(),
      writeFile: vi.fn(async () => undefined),
      readDir: vi.fn(async () => []),
      fileInfo: vi.fn(async () => undefined),
      rename: vi.fn(async () => undefined),
      deleteFile: vi.fn(async () => undefined),
      rmdir: vi.fn(async () => undefined),
      mkdir: vi.fn(async () => undefined),
      isDirExist: vi.fn(async () => true),
      isFileExist: vi.fn(async () => true),
      utimeSync: vi.fn(async () => undefined),
      init: vi.fn(async () => initGateA.promise),
      mount: mountSpyA,
    }),
    type: 'web',
  };

  const fsInfoB: FileSystemInfo = {
    name: 'stale-fs-b',
    fs: () => ({
      readFile: createReadFile(),
      writeFile: vi.fn(async () => undefined),
      readDir: vi.fn(async () => []),
      fileInfo: vi.fn(async () => undefined),
      rename: vi.fn(async () => undefined),
      deleteFile: vi.fn(async () => undefined),
      rmdir: vi.fn(async () => undefined),
      mkdir: vi.fn(async () => undefined),
      isDirExist: vi.fn(async () => true),
      isFileExist: vi.fn(async () => true),
      utimeSync: vi.fn(async () => undefined),
      init: vi.fn(async () => ({ root: '/b' })),
      mount: mountSpyB,
    }),
    type: 'desktop',
  };

  const store = useFileSystemManagerStore();
  const settingsStore = useSettingsStore();
  store.register(fsInfoA);
  store.register(fsInfoB);

  const pendingA = store.useFs('stale-fs-a');
  await Promise.resolve();
  const pendingB = store.useFs('stale-fs-b');

  initGateA.resolve({ root: '/a' });
  await Promise.all([pendingA, pendingB]);

  expect(settingsStore.settings.vault).toBe('/b');
  expect(mountSpyA).not.toHaveBeenCalled();
  expect(mountSpyB).toHaveBeenCalledWith({ root: '/b' });
});

test('reconfigureCurrentFs ignores stale mount result after root change', async () => {
  const firstMount = createDeferred<boolean>();
  const secondMount = createDeferred<boolean>();
  const mountSpy = vi
    .fn<() => Promise<boolean>>()
    .mockImplementationOnce(async () => firstMount.promise)
    .mockImplementationOnce(async () => secondMount.promise);

  const fsInfo: FileSystemInfo = {
    name: 'slow-mount-fs',
    fs: () => ({
      readFile: createReadFile(),
      writeFile: vi.fn(async () => undefined),
      readDir: vi.fn(async () => []),
      fileInfo: vi.fn(async () => undefined),
      rename: vi.fn(async () => undefined),
      deleteFile: vi.fn(async () => undefined),
      rmdir: vi.fn(async () => undefined),
      mkdir: vi.fn(async () => undefined),
      isDirExist: vi.fn(async () => true),
      isFileExist: vi.fn(async () => true),
      utimeSync: vi.fn(async () => undefined),
      init: vi.fn(async (params) => params),
      mount: mountSpy,
      pickFolder: vi.fn(async () => '/second-root'),
    }),
    type: 'desktop',
  };

  const store = useFileSystemManagerStore();
  store.register(fsInfo);

  const pendingMount = store.useFs('slow-mount-fs');
  await Promise.resolve();
  const pendingReconfigure = useFileSystemRootConfigurator().reconfigureCurrentFs();

  firstMount.resolve(true);
  await Promise.resolve();
  await Promise.resolve();
  expect(store.fsMounted).toBe(false);

  secondMount.resolve(true);
  await Promise.all([pendingMount, pendingReconfigure]);

  expect(store.fsMounted).toBe(true);
  expect(mountSpy).toHaveBeenLastCalledWith({ root: '/second-root' });
});

test('reconfigureCurrentFs accepts empty root returned by picker', async () => {
  const pickFolderSpy = vi.fn(async () => '');
  const mountSpy = vi.fn(async () => true);

  const fsInfo: FileSystemInfo = {
    name: 'empty-picker-root-fs',
    fs: () => ({
      readFile: createReadFile(),
      writeFile: vi.fn(async () => undefined),
      readDir: vi.fn(async () => []),
      fileInfo: vi.fn(async () => undefined),
      rename: vi.fn(async () => undefined),
      deleteFile: vi.fn(async () => undefined),
      rmdir: vi.fn(async () => undefined),
      mkdir: vi.fn(async () => undefined),
      isDirExist: vi.fn(async () => true),
      isFileExist: vi.fn(async () => true),
      utimeSync: vi.fn(async () => undefined),
      init: vi.fn(async (params) => params),
      mount: mountSpy,
      pickFolder: pickFolderSpy,
    }),
    type: 'web',
  };

  const store = useFileSystemManagerStore();
  const settingsStore = useSettingsStore();
  store.register(fsInfo);

  await store.useFs('empty-picker-root-fs');
  settingsStore.settings.vault = '/previous-root';

  await useFileSystemRootConfigurator().reconfigureCurrentFs();

  expect(settingsStore.settings.vault).toBe('');
  expect(pickFolderSpy).toHaveBeenCalledTimes(1);
  expect(mountSpy).toHaveBeenLastCalledWith({ root: '' });
});

test('reconfigureCurrentFs applies empty root returned by init', async () => {
  let initRoot = '/initial-root';
  const mountSpy = vi.fn(async () => true);

  const fsInfo: FileSystemInfo = {
    name: 'empty-root-fs',
    fs: () => ({
      readFile: createReadFile(),
      writeFile: vi.fn(async () => undefined),
      readDir: vi.fn(async () => []),
      fileInfo: vi.fn(async () => undefined),
      rename: vi.fn(async () => undefined),
      deleteFile: vi.fn(async () => undefined),
      rmdir: vi.fn(async () => undefined),
      mkdir: vi.fn(async () => undefined),
      isDirExist: vi.fn(async () => true),
      isFileExist: vi.fn(async () => true),
      utimeSync: vi.fn(async () => undefined),
      init: vi.fn(async () => ({ root: initRoot })),
      mount: mountSpy,
      pickFolder: vi.fn(async () => '/picked-root'),
    }),
    type: 'desktop',
  };

  const store = useFileSystemManagerStore();
  const settingsStore = useSettingsStore();
  store.register(fsInfo);

  await store.useFs('empty-root-fs');
  expect(settingsStore.settings.vault).toBe('/initial-root');

  initRoot = '';
  await useFileSystemRootConfigurator().reconfigureCurrentFs();

  expect(settingsStore.settings.vault).toBe('');
  expect(mountSpy).toHaveBeenLastCalledWith({ root: '' });
});

test('useFs maintains currentFsName when called with same name repeatedly', async () => {
  const initSpy = vi.fn(async () => ({ root: '/' }));

  const fsInfo: FileSystemInfo = {
    name: 'stable-fs',
    fs: () => ({
      readFile: createReadFile(),
      writeFile: vi.fn(async () => undefined),
      readDir: vi.fn(async () => []),
      fileInfo: vi.fn(async () => undefined),
      rename: vi.fn(async () => undefined),
      deleteFile: vi.fn(async () => undefined),
      rmdir: vi.fn(async () => undefined),
      mkdir: vi.fn(async () => undefined),
      isDirExist: vi.fn(async () => true),
      isFileExist: vi.fn(async () => true),
      utimeSync: vi.fn(async () => undefined),
      init: initSpy,
      mount: vi.fn(async () => true),
    }),
    type: 'web',
  };

  const store = useFileSystemManagerStore();
  store.register(fsInfo);

  await store.useFs('stable-fs');

  const nameAfterFirstCall = store.currentFsName;

  await store.useFs('stable-fs');
  await store.useFs('stable-fs');

  expect(store.currentFsName).toBe(nameAfterFirstCall);
  expect(store.currentFsName).toBe('stable-fs');
});
