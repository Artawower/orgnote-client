import { textToUint8Array, to, uint8ArrayToText } from 'orgnote-api/utils';
import { logger } from 'src/boot/logger';
import { reporter } from 'src/boot/report';

type FileContentStore = {
  read: (filePath: string) => Promise<Uint8Array>;
  write: (filePath: string, content: Uint8Array) => Promise<void>;
};

type FileSearchStore = {
  processFile: (filePath: string) => Promise<void>;
};

export type ContentMutator = (content: string) => string | undefined;

export interface FileMutationRunnerDeps {
  fileContent: FileContentStore;
  fileSearch: FileSearchStore;
}

const readContent = async (
  fileContent: FileContentStore,
  filePath: string,
): Promise<string | undefined> => {
  const result = await to(fileContent.read, 'Failed to read file')(filePath);
  if (result.isErr()) {
    reporter.reportError(result.error);
    return undefined;
  }
  return uint8ArrayToText(result.value);
};

const writeContent = async (
  fileContent: FileContentStore,
  filePath: string,
  content: string,
): Promise<boolean> => {
  const result = await to(fileContent.write, 'Failed to write file')(
    filePath,
    textToUint8Array(content),
  );
  if (result.isErr()) {
    reporter.reportError(result.error);
    return false;
  }
  return true;
};

const reindexFile = async (fileSearch: FileSearchStore, filePath: string): Promise<void> => {
  const result = await to(fileSearch.processFile, 'Failed to reindex file')(filePath);
  if (result.isErr()) reporter.reportError(result.error);
};

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error('Agenda mutation failed', { cause: error });

export const createFileMutationRunner = (deps: FileMutationRunnerDeps) => {
  const run = async (filePath: string, mutate: ContentMutator): Promise<void> => {
    const content = await readContent(deps.fileContent, filePath);
    if (content === undefined) {
      logger.warn('[agenda] mutationRunner: readContent returned undefined', { filePath });
      return;
    }
    let nextContent: string | undefined;
    try {
      nextContent = mutate(content);
    } catch (error) {
      logger.error('[agenda] mutationRunner: mutate threw', { error });
      reporter.reportError(toError(error));
      return;
    }
    if (!nextContent) {
      logger.warn('[agenda] mutationRunner: mutate returned undefined/empty', { filePath });
      return;
    }
    if (nextContent === content) {
      logger.warn('[agenda] mutationRunner: mutate returned same content, skip write', {
        filePath,
      });
      return;
    }
    logger.info('[agenda] mutationRunner: writing file', {
      filePath,
      contentLen: nextContent.length,
    });
    const written = await writeContent(deps.fileContent, filePath, nextContent);
    if (written) {
      logger.info('[agenda] mutationRunner: write success, reindexing');
      await reindexFile(deps.fileSearch, filePath);
      return;
    }
    logger.warn('[agenda] mutationRunner: write failed');
  };

  return { run };
};
