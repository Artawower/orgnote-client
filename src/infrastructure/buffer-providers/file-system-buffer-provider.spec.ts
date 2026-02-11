import { test, expect, vi, beforeEach } from 'vitest';

const mockReadFile = vi.fn();
const mockWriteFile = vi.fn();
const mockDecrypt = vi.fn();
const mockEncrypt = vi.fn();
const mockReportError = vi.fn();
const mockWatch = vi.fn();

const mockFileSystemManager: { currentFs: { readFile: typeof mockReadFile; writeFile: typeof mockWriteFile } | null } = {
  currentFs: {
    readFile: mockReadFile,
    writeFile: mockWriteFile,
  },
};

const mockEncryptionConfig: { config: { encryption: { type: string } } } = {
  config: {
    encryption: {
      type: 'enabled',
    },
  },
};

vi.mock('src/boot/api', () => ({
  api: {
    core: {
      useFileSystemManager: () => mockFileSystemManager,
      useEncryption: () => ({
        decrypt: mockDecrypt,
        encrypt: mockEncrypt,
      }),
      useConfig: () => mockEncryptionConfig,
    },
  },
}));

vi.mock('src/boot/report', () => ({
  reporter: {
    reportError: mockReportError,
  },
}));

vi.mock('src/stores/file-watcher', () => ({
  useFileWatcherStore: () => ({
    watch: mockWatch,
  }),
}));

const { createFileSystemBufferProvider } = await import('./file-system-buffer-provider');

beforeEach(() => {
  vi.clearAllMocks();
  mockReadFile.mockResolvedValue(new Uint8Array());
  mockWriteFile.mockResolvedValue(undefined);
  mockDecrypt.mockResolvedValue('decrypted content');
  mockEncrypt.mockResolvedValue('encrypted content');
  mockWatch.mockReturnValue(() => {});
  mockFileSystemManager.currentFs = {
    readFile: mockReadFile,
    writeFile: mockWriteFile,
  };
  mockEncryptionConfig.config.encryption.type = 'enabled';
});

test('createFileSystemBufferProvider read returns content for non-gpg files without decryption', async () => {
  const content = new TextEncoder().encode('* Test Note');
  mockReadFile.mockResolvedValue(content);

  const provider = createFileSystemBufferProvider();
  const result = await provider.read('/notes/test.org');

  expect(mockReadFile).toHaveBeenCalledWith('/notes/test.org', 'binary');
  expect(mockDecrypt).not.toHaveBeenCalled();
  expect(result).toEqual(content);
});

test('createFileSystemBufferProvider read decrypts armored .org.gpg files converting bytes to string before decrypt', async () => {
  const armoredText = '-----BEGIN PGP MESSAGE-----\ntest\n-----END PGP MESSAGE-----';
  const encryptedContent = new TextEncoder().encode(armoredText);
  mockReadFile.mockResolvedValue(encryptedContent);
  mockDecrypt.mockResolvedValue('decrypted text');

  const provider = createFileSystemBufferProvider();
  await provider.read('/notes/secret.org.gpg');

  expect(mockReadFile).toHaveBeenCalledWith('/notes/secret.org.gpg', 'binary');
  expect(mockDecrypt).toHaveBeenCalledWith(armoredText);
  expect(mockDecrypt).toHaveBeenCalledWith(expect.any(String));
});

test('createFileSystemBufferProvider read decrypts binary .org.gpg files passing Uint8Array to decrypt', async () => {
  const binaryContent = new Uint8Array([0xC0, 0x03, 0x04, 0x07, 0x02]);
  mockReadFile.mockResolvedValue(binaryContent);
  mockDecrypt.mockResolvedValue('decrypted text');

  const provider = createFileSystemBufferProvider();
  await provider.read('/notes/secret.org.gpg');

  expect(mockDecrypt).toHaveBeenCalledWith(binaryContent);
  expect(mockDecrypt).toHaveBeenCalledWith(expect.any(Uint8Array));
});

test('createFileSystemBufferProvider read throws when no file system selected', async () => {
  mockFileSystemManager.currentFs = null;

  const provider = createFileSystemBufferProvider();

  await expect(provider.read('/notes/test.org')).rejects.toThrow('No file system selected');
});

test('createFileSystemBufferProvider read throws EncryptionConfigRequiredError for gpg file when encryption disabled', async () => {
  mockEncryptionConfig.config.encryption.type = 'disabled';
  mockReadFile.mockResolvedValue(new Uint8Array([1, 2, 3]));

  const provider = createFileSystemBufferProvider();

  await expect(provider.read('/notes/secret.org.gpg')).rejects.toThrow(
    'This file is encrypted. Please configure encryption in Settings → Encryption to decrypt it.',
  );

  mockEncryptionConfig.config.encryption.type = 'enabled';
});

test('createFileSystemBufferProvider read returns empty content for empty gpg file without decryption', async () => {
  mockReadFile.mockResolvedValue(new Uint8Array());

  const provider = createFileSystemBufferProvider();
  const result = await provider.read('/notes/empty.org.gpg');

  expect(mockDecrypt).not.toHaveBeenCalled();
  expect(result).toEqual(new Uint8Array());
});

test('createFileSystemBufferProvider write encrypts content for .org.gpg files', async () => {
  const content = new TextEncoder().encode('* Secret Note');
  mockEncrypt.mockResolvedValue('encrypted binary data');

  const provider = createFileSystemBufferProvider();
  if (provider.write) {
    await provider.write('/notes/secret.org.gpg', content);
  }

  expect(mockEncrypt).toHaveBeenCalled();
  expect(mockWriteFile).toHaveBeenCalledWith(
    '/notes/secret.org.gpg',
    expect.any(Uint8Array),
    'binary',
  );
});

test('createFileSystemBufferProvider write passes content through for non-gpg files', async () => {
  const content = new TextEncoder().encode('* Public Note');

  const provider = createFileSystemBufferProvider();
  if (provider.write) {
    await provider.write('/notes/public.org', content);
  }

  expect(mockEncrypt).not.toHaveBeenCalled();
  expect(mockWriteFile).toHaveBeenCalledWith('/notes/public.org', content, 'binary');
});

test('createFileSystemBufferProvider write throws when no file system selected', async () => {
  mockFileSystemManager.currentFs = null;
  const content = new TextEncoder().encode('test');

  const provider = createFileSystemBufferProvider();

  if (provider.write) {
    await expect(provider.write('/notes/test.org', content)).rejects.toThrow(
      'No file system selected',
    );
  }
});

test('createFileSystemBufferProvider getContext extracts title from path', () => {
  const provider = createFileSystemBufferProvider();
  if (provider.getContext) {
    const context = provider.getContext('/path/to/my-note.org');
    expect(context.title).toBe('my-note.org');
  }
});

test('createFileSystemBufferProvider getContext returns Untitled for empty filename', () => {
  const provider = createFileSystemBufferProvider();
  if (provider.getContext) {
    const context = provider.getContext('/path/to/');
    expect(context.title).toBe('Untitled');
  }
});

test('createFileSystemBufferProvider scheme is file', () => {
  const provider = createFileSystemBufferProvider();

  expect(provider.scheme).toBe('file');
});
