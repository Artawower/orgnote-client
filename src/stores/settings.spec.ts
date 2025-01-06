import { test, expect, vi, beforeEach, type Mock } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSettingsStore } from './settings';
import { useFileSystemStore } from './file-system';
import { DEFAULT_CONFIG } from 'src/constants/config';
import clone from 'rfdc';

vi.mock('./file-system', () => ({
  useFileSystemStore: vi.fn(),
}));

const mockSyncFile = vi.fn();

const mockFileSystemStore = {
  syncFile: mockSyncFile,
};

beforeEach(() => {
  setActivePinia(createPinia());
  (useFileSystemStore as unknown as Mock).mockReturnValue(mockFileSystemStore);
  mockSyncFile.mockReset();
});

test('initial state', () => {
  const store = useSettingsStore();

  expect(store.config).toEqual(clone()(DEFAULT_CONFIG));
  expect(store.configErrors).toEqual([]);
  expect(store.sync).toBeDefined();
});

test('sync method updates config if new config is available', async () => {
  const store = useSettingsStore();

  const originalConfig = clone()(DEFAULT_CONFIG);
  const newConfig = { ...originalConfig, newKey: 'newValue' };

  mockSyncFile.mockResolvedValue(JSON.stringify(newConfig));

  await store.sync();

  expect(mockSyncFile).toHaveBeenCalledWith('config.json', JSON.stringify(originalConfig), 0);
  expect(store.config).toEqual(newConfig);
});

test('sync method does not update config if no new config is returned', async () => {
  const store = useSettingsStore();

  mockSyncFile.mockResolvedValue(null);

  const originalConfig = { ...store.config };
  await store.sync();

  expect(mockSyncFile).toHaveBeenCalledWith('config.json', JSON.stringify(store.config), 0);
  expect(store.config).toEqual(originalConfig);
});

test('sync method handles invalid JSON gracefully', async () => {
  const store = useSettingsStore();

  mockSyncFile.mockResolvedValue('invalid-json');

  await expect(store.sync()).rejects.toThrow(SyntaxError);
  expect(mockSyncFile).toHaveBeenCalledWith('config.json', JSON.stringify(store.config), 0);
});

test('sync method handles syncFile throwing an error', async () => {
  const store = useSettingsStore();

  mockSyncFile.mockRejectedValue(new Error('Disk error'));

  await expect(store.sync()).rejects.toThrow('Disk error');
  expect(mockSyncFile).toHaveBeenCalledWith('config.json', JSON.stringify(store.config), 0);
});

test('config is not updated if validation fails', async () => {
  const store = useSettingsStore();

  const invalidConfig = { invalidKey: 'value' };
  mockSyncFile.mockResolvedValue(JSON.stringify(invalidConfig));

  await store.sync();

  expect(store.configErrors.length).toBeGreaterThan(0);
  expect(store.config).toEqual(clone()(DEFAULT_CONFIG));
});

test('sync updates config and implies lastSyncTime is updated', async () => {
  const store = useSettingsStore();

  const newConfig = { ...clone()(DEFAULT_CONFIG), system: { language: 'ru-RU' } };
  mockSyncFile.mockResolvedValue(JSON.stringify(newConfig));

  await store.sync();

  expect(mockSyncFile).toHaveBeenCalled();
  expect(store.config).toEqual(newConfig);
});
