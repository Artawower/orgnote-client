import { setActivePinia, createPinia } from 'pinia';
import { useEncryptionStore } from 'src/stores/encryption';
import { vi, test, beforeEach, expect, type Mock } from 'vitest';
import { encryptNote, decryptNote, encrypt, decrypt } from 'orgnote-api/encryption';

vi.mock('orgnote-api/encryption', () => ({
  encrypt: vi.fn(),
  decrypt: vi.fn(),
  encryptNote: vi.fn(),
  decryptNote: vi.fn(),
}));

beforeEach(() => {
  setActivePinia(createPinia());
  vi.mock('src/stores/settings', () => ({
    useSettingsStore: vi.fn(() => ({
      config: {
        encryption: { type: 'GpgPassword', password: 'test-password' },
      },
    })),
  }));
});

test('encrypt calls encrypt with correct parameters', async () => {
  const encryptionStore = useEncryptionStore();
  const mockEncryptResponse = 'encrypted-data';
  (encrypt as Mock).mockResolvedValue(mockEncryptResponse);

  const result = await encryptionStore.encrypt('test-data', 'binary');

  expect(encrypt).toHaveBeenCalledWith({
    content: 'test-data',
    format: 'binary',
    type: 'GpgPassword',
    password: 'test-password',
  });
  expect(result).toBe(mockEncryptResponse);
});

test('decrypt calls decrypt with correct parameters', async () => {
  const encryptionStore = useEncryptionStore();
  const mockDecryptResponse = 'decrypted-data';
  (decrypt as Mock).mockResolvedValue(mockDecryptResponse);

  const result = await encryptionStore.decrypt('encrypted-data', 'utf8');

  expect(decrypt).toHaveBeenCalledWith({
    content: 'encrypted-data',
    format: 'utf8',
    type: 'GpgPassword',
    password: 'test-password',
  });
  expect(result).toBe(mockDecryptResponse);
});

test('encryptNote calls encryptNote with correct parameters', async () => {
  const encryptionStore = useEncryptionStore();
  const mockEncryptNoteResponse: [object, string] = [{}, 'encrypted-note-content'];
  (encryptNote as Mock).mockResolvedValue(mockEncryptNoteResponse);

  const noteInfo = {
    id: 'note-1',
    meta: {},
    createdAt: '',
    updatedAt: '',
    touchedAt: '',
    filePath: ['path', 'to', 'file'],
  };
  const result = await encryptionStore.encryptNote(noteInfo, 'note-content');

  expect(encryptNote).toHaveBeenCalledWith(noteInfo, {
    content: 'note-content',
    type: 'GpgPassword',
    password: 'test-password',
  });
  expect(result).toEqual(mockEncryptNoteResponse);
});

test('decryptNote calls decryptNote with correct parameters', async () => {
  const encryptionStore = useEncryptionStore();
  const mockDecryptNoteResponse: [object, string] = [{}, 'decrypted-note-content'];
  (decryptNote as Mock).mockResolvedValue(mockDecryptNoteResponse);

  const noteInfo = {
    id: 'note-1',
    meta: {},
    createdAt: '',
    updatedAt: '',
    touchedAt: '',
    filePath: ['path', 'to', 'file'],
  };
  const result = await encryptionStore.decryptNote(noteInfo, 'encrypted-note-content');

  expect(decryptNote).toHaveBeenCalledWith(noteInfo, {
    content: 'encrypted-note-content',
    type: 'GpgPassword',
    password: 'test-password',
  });
  expect(result).toEqual(mockDecryptNoteResponse);
});
