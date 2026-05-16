import { textToUint8Array, to, uint8ArrayToText } from 'orgnote-api/utils';
import { reporter } from 'src/boot/report';

type FileContentStore = {
  read: (filePath: string) => Promise<Uint8Array>;
  write: (filePath: string, content: Uint8Array) => Promise<void>;
};

type FileSearchStore = {
  processFile: (filePath: string) => Promise<void>;
};

export type ContentMutator = (content: string) => string;

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

export const createFileMutationRunner = (deps: FileMutationRunnerDeps) => {
  const run = async (filePath: string, mutate: ContentMutator): Promise<void> => {
    const content = await readContent(deps.fileContent, filePath);
    if (content === undefined) return;
    const mutationResult = to(mutate, 'Agenda mutation failed')(content);
    if (mutationResult.isErr()) {
      reporter.reportError(mutationResult.error);
      return;
    }
    const nextContent = mutationResult.value;
    if (nextContent === content) return;
    const written = await writeContent(deps.fileContent, filePath, nextContent);
    if (written) await reindexFile(deps.fileSearch, filePath);
  };

  return { run };
};
