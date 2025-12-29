import { RouteNames, type FileReaderStore, type FileReaderEntry } from 'orgnote-api';
import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { usePaneStore } from './pane';
import { useConfigStore } from './config';

const DEFAULT_PRIORITY = 10;

const sortByPriority = (a: FileReaderEntry, b: FileReaderEntry): number =>
  (b.meta.priority ?? DEFAULT_PRIORITY) - (a.meta.priority ?? DEFAULT_PRIORITY);

const findById = (readers: FileReaderEntry[], id: string): FileReaderEntry | undefined =>
  readers.find((r) => r.meta.id === id);

const getExtensionCandidates = (path: string): string[] => {
  const fileName = path.split('/').pop() ?? '';
  const parts = fileName.split('.').slice(1);
  if (parts.length === 0) return [];
  return parts.map((_, index) => parts.slice(index).join('.'));
};

export const useFileReaderStore = defineStore<string, FileReaderStore>(
  'file-reader',
  (): FileReaderStore => {
    const readers = shallowRef<FileReaderEntry[]>([]);

    const pane = usePaneStore();
    const configStore = useConfigStore();

    const getPreferredReaderId = (path: string): string | undefined => {
      const preferredReaders = configStore.config.fileReaders?.preferredReaders;
      if (!preferredReaders) return undefined;

      return getExtensionCandidates(path)
        .map((extension) => preferredReaders[extension])
        .find((id) => !!id);
    };

    const findPreferredReader = (
      matching: FileReaderEntry[],
      path: string,
    ): FileReaderEntry | undefined => {
      const preferredId = getPreferredReaderId(path);
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
