import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import type { DiskFile, FileSystemChange } from 'orgnote-api';
import type { Mock } from 'vitest';

let readDir: Mock;
let fileManagerPath: ReturnType<typeof ref<string>>;
let watcherCallbacks: Map<string, (change: FileSystemChange) => void>;
let fileWatcherWatch: Mock;
let bufferViewerOpen: Mock;

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('src/boot/api', () => ({
  api: {
    core: {
      useFileManager: () => ({ path: fileManagerPath }),
      useFileSystem: () => ({ readDir }),
      useFileWatcher: () => ({ watch: fileWatcherWatch }),
      useBufferViewer: () => ({ open: bufferViewerOpen }),
      usePane: () => ({ activeTab: undefined }),
    },
    ui: {
      useSidebar: () => ({ close: vi.fn() }),
      useScreenDetection: () => ({ tabletBelow: ref(false) }),
    },
  },
}));

import FileManager from './FileManager.vue';

const createDiskFile = (overrides: Partial<DiskFile>): DiskFile =>
  ({
    path: '/test/file',
    name: 'file',
    type: 'file',
    mtime: 1,
    ...overrides,
  }) as DiskFile;

const flushDebounce = async (ms = 100): Promise<void> => {
  await vi.advanceTimersByTimeAsync(ms);
  await Promise.resolve();
};

describe('FileManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();

    fileManagerPath = ref('/initial');
    watcherCallbacks = new Map();

    readDir = vi.fn(async () => [createDiskFile({ path: '/initial/a.org', name: 'a.org' })]);

    fileWatcherWatch = vi.fn((path: string, callback: (change: FileSystemChange) => void) => {
      watcherCallbacks.set(path, callback);
      return () => watcherCallbacks.delete(path);
    });

    bufferViewerOpen = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('reads current directory and starts watching it on mount', async () => {
    shallowMount(FileManager, { props: { path: '/initial' } });
    await nextTick();

    expect(readDir).toHaveBeenCalledWith('/initial');
    expect(fileWatcherWatch).toHaveBeenCalledWith('/initial', expect.any(Function), {
      recursive: false,
    });
  });

  test('refreshes when watcher notifies changes', async () => {
    shallowMount(FileManager, { props: { path: '/initial' } });
    await nextTick();
    expect(readDir).toHaveBeenCalledTimes(1);

    const callback = watcherCallbacks.get('/initial');
    callback?.({ path: '/initial/a.org', type: 'modify', mtime: 2 });
    await flushDebounce();

    expect(readDir).toHaveBeenCalledTimes(2);
  });

  test('switches watcher when targetPath changes', async () => {
    shallowMount(FileManager, { props: { path: '/initial' } });
    await nextTick();

    const initialCallback = watcherCallbacks.get('/initial');
    expect(initialCallback).toBeDefined();

    fileManagerPath.value = '/next';
    await nextTick();

    expect(watcherCallbacks.has('/initial')).toBe(false);
    expect(watcherCallbacks.has('/next')).toBe(true);
    expect(readDir).toHaveBeenCalledWith('/next');
  });

  test('unsubscribes and cancels pending refresh on unmount', async () => {
    const wrapper = shallowMount(FileManager, { props: { path: '/initial' } });
    await nextTick();
    expect(readDir).toHaveBeenCalledTimes(1);

    const callback = watcherCallbacks.get('/initial');
    callback?.({ path: '/initial/a.org', type: 'modify', mtime: 2 });
    wrapper.unmount();
    await flushDebounce();

    expect(readDir).toHaveBeenCalledTimes(1);
  });
});
