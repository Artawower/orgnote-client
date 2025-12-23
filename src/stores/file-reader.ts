import { RouteNames, type FileReaderStore, type FileReaderEntry } from 'orgnote-api';
import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { usePaneStore } from './pane';
import { useConfigStore } from './config';

const DEFAULT_PRIORITY = 10;

const extractExtension = (path: string): string => {
  const fileName = path.split('/').pop() ?? '';
  const dotIndex = fileName.indexOf('.');
  if (dotIndex === -1) return '';
  return fileName.slice(dotIndex + 1);
};

const sortByPriority = (a: FileReaderEntry, b: FileReaderEntry): number =>
  (b.meta.priority ?? DEFAULT_PRIORITY) - (a.meta.priority ?? DEFAULT_PRIORITY);

const findById = (readers: FileReaderEntry[], id: string): FileReaderEntry | undefined =>
  readers.find((r) => r.meta.id === id);

export const useFileReaderStore = defineStore<string, FileReaderStore>(
  'file-reader',
  (): FileReaderStore => {
    const readers = shallowRef<FileReaderEntry[]>([]);

    const pane = usePaneStore();
    const configStore = useConfigStore();

    const getPreferredReaderId = (extension: string): string | undefined =>
      configStore.config.fileReaders?.preferredReaders?.[extension];

    const findPreferredReader = (
      matching: FileReaderEntry[],
      path: string,
    ): FileReaderEntry | undefined => {
      const extension = extractExtension(path);
      const preferredId = getPreferredReaderId(extension);
      if (!preferredId) return undefined;
      return findById(matching, preferredId);
    };

    const register = (entry: FileReaderEntry): void => {
      readers.value = [...readers.value, entry];
    };

    const unregister = (readerId: string): void => {
      readers.value = readers.value.filter((r) => r.meta.id !== readerId);
    };

    const getReaders = (path: string): FileReaderEntry[] => {
      return readers.value
        .filter((r) => new RegExp(r.pattern).test(path))
        .sort(sortByPriority);
    };

    const getReader = (path: string): FileReaderEntry | undefined => {
      const matching = getReaders(path);
      if (!matching.length) return undefined;
      return findPreferredReader(matching, path) ?? matching[0];
    };

    const openFile = async (path: string): Promise<void> => {
      await pane.navigate({
        name: RouteNames.File,
        params: { path },
      });
    };

    return {
      register,
      unregister,
      getReaders,
      getReader,
      openFile,
    };
  },
);
