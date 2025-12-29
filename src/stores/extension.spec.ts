import 'fake-indexeddb/auto';
import { setActivePinia, createPinia } from 'pinia';
import { test, expect, beforeEach, vi } from 'vitest';
import { useExtensionsStore } from './extension';
import type { ExtensionManifest, ExtensionMeta, ExtensionSource } from 'orgnote-api';

vi.mock('src/boot/api', () => ({
  api: {
    infrastructure: {
      extensionSourceRepository: {
        get: vi.fn(),
        upsert: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      },
    },
  },
}));

vi.mock('src/boot/report', () => ({
  reporter: {
    reportError: vi.fn(),
    reportWarning: vi.fn(),
  },
}));

vi.mock('./file-system', () => ({
  useFileSystemStore: () => ({
    readFile: vi.fn().mockResolvedValue(null),
    writeFile: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('./git', () => ({
  useGitStore: () => ({
    openRepo: vi.fn(),
  }),
}));

vi.mock('./config', () => ({
  useConfigStore: () => ({
    config: {
      ui: {
        darkThemeName: null,
        lightThemeName: null,
      },
    },
  }),
}));

vi.mock('src/utils/css-utils', () => ({
  resetCSSVariables: vi.fn(),
}));

vi.mock('src/extensions', () => ({
  BUILTIN_LOADERS: {},
  BUILTIN_META: [],
}));

vi.mock('src/utils/read-extension', () => ({
  compileExtension: vi.fn(),
  parseExtensionFromFile: vi.fn(),
}));

vi.mock('src/utils/validate-manifest', () => ({
  validateManifest: vi.fn(),
}));

const createMockManifest = (name: string, overrides?: Partial<ExtensionManifest>): ExtensionManifest => ({
  name,
  version: '1.0.0',
  category: 'extension',
  source: { type: 'local' },
  ...overrides,
});

const createMockExtensionMeta = (name: string, overrides?: Partial<ExtensionMeta>): ExtensionMeta => ({
  manifest: createMockManifest(name),
  active: false,
  ...overrides,
});

const createMockExtensionSource = (name: string): ExtensionSource => ({
  name,
  version: '1.0.0',
  source: 'local',
  module: 'export const onMounted = () => {}',
  docFiles: [],
});

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

test('extensions list is empty initially', () => {
  const store = useExtensionsStore();

  expect(store.extensions).toHaveLength(0);
});

test('ready is true initially when not syncing', () => {
  const store = useExtensionsStore();

  expect(store.ready).toBe(true);
});

test('isExtensionExist returns false for non-existent extension', () => {
  const store = useExtensionsStore();

  expect(store.isExtensionExist('non-existent')).toBe(false);
});

test('isExtensionExist returns true after adding extension', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('test-extension');
  const source = createMockExtensionSource('test-extension');

  await store.addExtension(meta, source);

  expect(store.isExtensionExist('test-extension')).toBe(true);
});

test('addExtension adds extension to list', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('my-extension');
  const source = createMockExtensionSource('my-extension');

  await store.addExtension(meta, source);

  expect(store.extensions).toHaveLength(1);
  expect(store.extensions[0]?.manifest.name).toBe('my-extension');
});

test('addExtension replaces existing extension with same name', async () => {
  const store = useExtensionsStore();
  const meta1 = createMockExtensionMeta('duplicate', { manifest: createMockManifest('duplicate', { version: '1.0.0' }) });
  const meta2 = createMockExtensionMeta('duplicate', { manifest: createMockManifest('duplicate', { version: '2.0.0' }) });
  const source = createMockExtensionSource('duplicate');

  await store.addExtension(meta1, source);
  await store.addExtension(meta2, source);

  expect(store.extensions).toHaveLength(1);
  expect(store.extensions[0]?.manifest.version).toBe('2.0.0');
});

test('deleteExtension removes extension from list', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('to-delete');
  const source = createMockExtensionSource('to-delete');

  await store.addExtension(meta, source);
  expect(store.extensions).toHaveLength(1);

  await store.deleteExtension('to-delete');

  expect(store.extensions).toHaveLength(0);
});

test('deleteExtension does nothing for non-existent extension', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('existing');
  const source = createMockExtensionSource('existing');

  await store.addExtension(meta, source);

  await store.deleteExtension('non-existent');

  expect(store.extensions).toHaveLength(1);
});

test('enableExtension does nothing for non-existent extension', async () => {
  const { reporter } = await import('src/boot/report');
  const store = useExtensionsStore();

  await store.enableExtension('non-existent');

  expect(reporter.reportWarning).toHaveBeenCalledWith('Extension non-existent not found');
});

test('enableExtension sets active to true', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('to-enable', { active: false });
  const source = createMockExtensionSource('to-enable');

  await store.addExtension(meta, source);
  await store.enableExtension('to-enable');

  const ext = store.extensions.find((e) => e.manifest.name === 'to-enable');
  expect(ext?.active).toBe(true);
});

test('enableExtension does nothing if already active', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('already-active', { active: true });
  const source = createMockExtensionSource('already-active');

  await store.addExtension(meta, source);

  const extensionsBefore = [...store.extensions];
  await store.enableExtension('already-active');

  expect(store.extensions[0]?.active).toBe(true);
  expect(store.extensions).toEqual(extensionsBefore);
});

test('disableExtension does nothing for non-existent extension', async () => {
  const { reporter } = await import('src/boot/report');
  const store = useExtensionsStore();

  await store.disableExtension('non-existent');

  expect(reporter.reportWarning).toHaveBeenCalledWith('Extension non-existent not found');
});

test('disableExtension sets active to false', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('to-disable', { active: true });
  const source = createMockExtensionSource('to-disable');

  await store.addExtension(meta, source);
  await store.disableExtension('to-disable');

  const ext = store.extensions.find((e) => e.manifest.name === 'to-disable');
  expect(ext?.active).toBe(false);
});

test('multiple extensions can be added', async () => {
  const store = useExtensionsStore();

  await store.addExtension(createMockExtensionMeta('ext-1'), createMockExtensionSource('ext-1'));
  await store.addExtension(createMockExtensionMeta('ext-2'), createMockExtensionSource('ext-2'));
  await store.addExtension(createMockExtensionMeta('ext-3'), createMockExtensionSource('ext-3'));

  expect(store.extensions).toHaveLength(3);
  expect(store.extensions.map((e) => e.manifest.name)).toEqual(['ext-1', 'ext-2', 'ext-3']);
});

test('deleteExtension removes only specified extension', async () => {
  const store = useExtensionsStore();

  await store.addExtension(createMockExtensionMeta('ext-1'), createMockExtensionSource('ext-1'));
  await store.addExtension(createMockExtensionMeta('ext-2'), createMockExtensionSource('ext-2'));
  await store.addExtension(createMockExtensionMeta('ext-3'), createMockExtensionSource('ext-3'));

  await store.deleteExtension('ext-2');

  expect(store.extensions).toHaveLength(2);
  expect(store.extensions.map((e) => e.manifest.name)).toEqual(['ext-1', 'ext-3']);
});

test('installExtension throws for local source type', async () => {
  const { reporter } = await import('src/boot/report');
  const store = useExtensionsStore();

  await store.installExtension({ type: 'local' });

  expect(reporter.reportError).toHaveBeenCalled();
});

test('installExtension throws for builtin source type', async () => {
  const { reporter } = await import('src/boot/report');
  const store = useExtensionsStore();

  await store.installExtension({ type: 'builtin' });

  expect(reporter.reportError).toHaveBeenCalled();
});

test('enable and disable cycle works correctly', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('toggle-ext', { active: false });
  const source = createMockExtensionSource('toggle-ext');

  await store.addExtension(meta, source);

  expect(store.extensions[0]?.active).toBe(false);

  await store.enableExtension('toggle-ext');
  expect(store.extensions[0]?.active).toBe(true);

  await store.disableExtension('toggle-ext');
  expect(store.extensions[0]?.active).toBe(false);

  await store.enableExtension('toggle-ext');
  expect(store.extensions[0]?.active).toBe(true);
});

test('addExtension with active true enables extension', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('auto-enable', { active: true });
  const source = createMockExtensionSource('auto-enable');

  await store.addExtension(meta, source);

  expect(store.extensions[0]?.active).toBe(true);
});

test('isExtensionExist handles empty string', () => {
  const store = useExtensionsStore();

  expect(store.isExtensionExist('')).toBe(false);
});

test('isExtensionExist is case sensitive', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('CaseSensitive');
  const source = createMockExtensionSource('CaseSensitive');

  await store.addExtension(meta, source);

  expect(store.isExtensionExist('CaseSensitive')).toBe(true);
  expect(store.isExtensionExist('casesensitive')).toBe(false);
  expect(store.isExtensionExist('CASESENSITIVE')).toBe(false);
});

test('deleteExtension is case sensitive', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('CaseSensitive');
  const source = createMockExtensionSource('CaseSensitive');

  await store.addExtension(meta, source);

  await store.deleteExtension('casesensitive');
  expect(store.extensions).toHaveLength(1);

  await store.deleteExtension('CaseSensitive');
  expect(store.extensions).toHaveLength(0);
});

test('enableExtension is case sensitive', async () => {
  const { reporter } = await import('src/boot/report');
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('CaseSensitive', { active: false });
  const source = createMockExtensionSource('CaseSensitive');

  await store.addExtension(meta, source);

  await store.enableExtension('casesensitive');
  expect(reporter.reportWarning).toHaveBeenCalled();
  expect(store.extensions[0]?.active).toBe(false);
});

test('sync sets ready to true after completion', async () => {
  const store = useExtensionsStore();

  await store.sync();

  expect(store.ready).toBe(true);
});

test('extensions with special characters in name', async () => {
  const store = useExtensionsStore();
  const specialName = 'ext-with_special.chars@1.0';
  const meta = createMockExtensionMeta(specialName);
  const source = createMockExtensionSource(specialName);

  await store.addExtension(meta, source);

  expect(store.isExtensionExist(specialName)).toBe(true);
  expect(store.extensions[0]?.manifest.name).toBe(specialName);
});

test('addExtension preserves other extensions when replacing', async () => {
  const store = useExtensionsStore();

  await store.addExtension(createMockExtensionMeta('ext-1'), createMockExtensionSource('ext-1'));
  await store.addExtension(createMockExtensionMeta('ext-2'), createMockExtensionSource('ext-2'));
  await store.addExtension(createMockExtensionMeta('ext-3'), createMockExtensionSource('ext-3'));

  const updatedMeta = createMockExtensionMeta('ext-2', {
    manifest: createMockManifest('ext-2', { version: '9.9.9' }),
  });
  await store.addExtension(updatedMeta, createMockExtensionSource('ext-2'));

  expect(store.extensions).toHaveLength(3);
  expect(store.extensions.find((e) => e.manifest.name === 'ext-1')).toBeDefined();
  expect(store.extensions.find((e) => e.manifest.name === 'ext-3')).toBeDefined();
  expect(store.extensions.find((e) => e.manifest.name === 'ext-2')?.manifest.version).toBe('9.9.9');
});

test('disableExtension on already disabled extension', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('disabled-ext', { active: false });
  const source = createMockExtensionSource('disabled-ext');

  await store.addExtension(meta, source);

  await store.disableExtension('disabled-ext');

  expect(store.extensions[0]?.active).toBe(false);
});

test('rapid enable/disable does not corrupt state', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('rapid-toggle', { active: false });
  const source = createMockExtensionSource('rapid-toggle');

  await store.addExtension(meta, source);

  await Promise.all([
    store.enableExtension('rapid-toggle'),
    store.disableExtension('rapid-toggle'),
    store.enableExtension('rapid-toggle'),
  ]);

  const ext = store.extensions.find((e) => e.manifest.name === 'rapid-toggle');
  expect(ext).toBeDefined();
  expect(typeof ext?.active).toBe('boolean');
});

test('deleteExtension while extension is active', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('active-delete', { active: true });
  const source = createMockExtensionSource('active-delete');

  await store.addExtension(meta, source);
  await store.enableExtension('active-delete');

  await store.deleteExtension('active-delete');

  expect(store.extensions).toHaveLength(0);
  expect(store.isExtensionExist('active-delete')).toBe(false);
});

test('theme extension disables other themes when enabled', async () => {
  const store = useExtensionsStore();

  const theme1 = createMockExtensionMeta('theme-1', {
    manifest: createMockManifest('theme-1', { category: 'theme' }),
    active: true,
  });
  const theme2 = createMockExtensionMeta('theme-2', {
    manifest: createMockManifest('theme-2', { category: 'theme' }),
    active: false,
  });

  await store.addExtension(theme1, createMockExtensionSource('theme-1'));
  await store.addExtension(theme2, createMockExtensionSource('theme-2'));

  await store.enableExtension('theme-2');

  const t1 = store.extensions.find((e) => e.manifest.name === 'theme-1');
  const t2 = store.extensions.find((e) => e.manifest.name === 'theme-2');

  expect(t2?.active).toBe(true);
  expect(t1?.active).toBe(false);
});

test('non-theme extension does not affect other extensions', async () => {
  const store = useExtensionsStore();

  const ext1 = createMockExtensionMeta('ext-1', { active: true });
  const ext2 = createMockExtensionMeta('ext-2', { active: false });

  await store.addExtension(ext1, createMockExtensionSource('ext-1'));
  await store.addExtension(ext2, createMockExtensionSource('ext-2'));

  await store.enableExtension('ext-2');

  expect(store.extensions.find((e) => e.manifest.name === 'ext-1')?.active).toBe(true);
  expect(store.extensions.find((e) => e.manifest.name === 'ext-2')?.active).toBe(true);
});

test('enableSafeMode keeps local extensions active', async () => {
  const store = useExtensionsStore();

  const localExt = createMockExtensionMeta('local-ext', {
    manifest: createMockManifest('local-ext', { source: { type: 'local' } }),
    active: true,
  });

  await store.addExtension(localExt, createMockExtensionSource('local-ext'));
  await store.enableExtension('local-ext');

  await store.enableSafeMode();

  expect(store.extensions.find((e) => e.manifest.name === 'local-ext')?.active).toBe(true);
});

test('disableSafeMode remounts active extensions', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('safe-mode-ext', { active: true });
  const source = createMockExtensionSource('safe-mode-ext');

  await store.addExtension(meta, source);

  await store.enableSafeMode();
  await store.disableSafeMode();

  expect(store.extensions.find((e) => e.manifest.name === 'safe-mode-ext')?.active).toBe(true);
});

test('addExtension with empty name', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('');
  const source = createMockExtensionSource('');

  await store.addExtension(meta, source);

  expect(store.extensions).toHaveLength(1);
  expect(store.isExtensionExist('')).toBe(true);
});

test('multiple theme extensions - only one active at a time', async () => {
  const store = useExtensionsStore();

  const themes = ['theme-a', 'theme-b', 'theme-c'].map((name) =>
    createMockExtensionMeta(name, {
      manifest: createMockManifest(name, { category: 'theme' }),
      active: false,
    })
  );

  for (const theme of themes) {
    await store.addExtension(theme, createMockExtensionSource(theme.manifest.name));
  }

  await store.enableExtension('theme-a');
  await store.enableExtension('theme-b');
  await store.enableExtension('theme-c');

  const activeThemes = store.extensions.filter(
    (e) => e.manifest.category === 'theme' && e.active
  );

  expect(activeThemes).toHaveLength(1);
  expect(activeThemes[0]?.manifest.name).toBe('theme-c');
});

test('extension config is preserved after enable/disable', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('config-ext', {
    active: false,
    config: { setting1: 'value1', setting2: 42 },
  });
  const source = createMockExtensionSource('config-ext');

  await store.addExtension(meta, source);
  await store.enableExtension('config-ext');
  await store.disableExtension('config-ext');

  const ext = store.extensions.find((e) => e.manifest.name === 'config-ext');
  expect(ext?.config).toEqual({ setting1: 'value1', setting2: 42 });
});

test('deleteExtension multiple times is safe', async () => {
  const store = useExtensionsStore();
  const meta = createMockExtensionMeta('multi-delete');
  const source = createMockExtensionSource('multi-delete');

  await store.addExtension(meta, source);

  await store.deleteExtension('multi-delete');
  await store.deleteExtension('multi-delete');
  await store.deleteExtension('multi-delete');

  expect(store.extensions).toHaveLength(0);
});

test('sync multiple times does not duplicate extensions', async () => {
  const store = useExtensionsStore();

  await store.sync();
  await store.sync();
  await store.sync();

  const uniqueNames = new Set(store.extensions.map((e) => e.manifest.name));
  expect(uniqueNames.size).toBe(store.extensions.length);
});

test('extension order is preserved after operations', async () => {
  const store = useExtensionsStore();
  const names = ['first', 'second', 'third'];

  for (const name of names) {
    await store.addExtension(createMockExtensionMeta(name), createMockExtensionSource(name));
  }

  await store.enableExtension('second');
  await store.disableExtension('second');

  expect(store.extensions.map((e) => e.manifest.name)).toEqual(names);
});
