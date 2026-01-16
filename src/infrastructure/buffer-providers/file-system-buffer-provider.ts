import type { BufferProvider, BufferContext, FileSystemChange } from 'orgnote-api';
import { isOrgGpgFile } from 'orgnote-api';
import { to, uint8ArrayToText, textToUint8Array } from 'orgnote-api/utils';
import type { ResultAsync } from 'neverthrow';
import { errAsync, okAsync } from 'neverthrow';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import { useFileWatcherStore } from 'src/stores/file-watcher';

class EncryptionConfigRequiredError extends Error {
  constructor() {
    super('Encryption configuration is required to handle encrypted files.');
  }
}

const extractTitleFromPath = (path: string): string => path.split('/').pop() || 'Untitled';

const isEncryptionConfigValid = (): boolean =>
  api.core.useConfig().config.encryption.type !== 'disabled';

const encryptContent = (filePath: string, content: Uint8Array): ResultAsync<Uint8Array, Error> => {
  if (!isOrgGpgFile(filePath)) {
    return okAsync(content);
  }
  if (!isEncryptionConfigValid()) {
    return errAsync(new EncryptionConfigRequiredError());
  }
  const text = uint8ArrayToText(content);
  return to(api.core.useEncryption().encrypt)(text).map(textToUint8Array);
};

const decryptContent = (filePath: string, content: Uint8Array): ResultAsync<Uint8Array, Error> => {
  if (!content.length || !isOrgGpgFile(filePath)) {
    return okAsync(content);
  }
  if (!isEncryptionConfigValid()) {
    return errAsync(new EncryptionConfigRequiredError());
  }
  const text = uint8ArrayToText(content);
  return to(api.core.useEncryption().decrypt)(text).map(textToUint8Array);
};

export const createFileSystemBufferProvider = (): BufferProvider => ({
  scheme: 'file',

  async read(path: string): Promise<Uint8Array> {
    const fm = api.core.useFileSystemManager();
    if (!fm.currentFs) {
      throw new Error('No file system selected');
    }

    const safeRead = to(fm.currentFs.readFile, 'Failed to load buffer content');
    const result = await safeRead<'binary', Uint8Array>(path, 'binary').andThen((content) =>
      decryptContent(path, content),
    );

    if (result.isErr()) {
      reporter.reportError(new Error(`Failed to load: ${path}`, { cause: result.error }));
      throw result.error;
    }

    return result.value;
  },

  async write(path: string, content: Uint8Array): Promise<void> {
    const fm = api.core.useFileSystemManager();
    if (!fm.currentFs) {
      throw new Error('No file system selected');
    }

    const result = await encryptContent(path, content).andThen((encrypted) =>
      to(fm.currentFs!.writeFile)(path, encrypted, 'binary'),
    );

    if (result.isErr()) {
      reporter.reportError(new Error(`Failed to save: ${path}`, { cause: result.error }));
      throw result.error;
    }
  },

  watch(path: string, callback: (change: FileSystemChange) => void): () => void {
    const fileWatcher = useFileWatcherStore();
    return fileWatcher.watch(path, callback);
  },

  getContext(path: string): BufferContext {
    return {
      title: extractTitleFromPath(path),
    };
  },
});
