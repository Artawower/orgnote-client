import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Document, type EnrichedDocumentSearchResults } from 'flexsearch';
import type { FileMeta, FileSearchStore, DiskFile } from 'orgnote-api';
import { isOrgFile, isOrgGpgFile, to } from 'orgnote-api';
import { parse, withMetaInfo } from 'org-mode-ast';
import { repositories } from 'src/boot/repositories';
import { useQueueStore } from 'src/stores/queue';
import { useFileSystemStore } from 'src/stores/file-system';
import { useEncryptionStore } from 'src/stores/encryption';
import { INDEX_QUEUE_ID } from 'src/constants/queue-ids';

const FILE_INDEX_KEY = 'file-index';
const LAST_INDEXED_AT_KEY = 'file-index-last-indexed-at';
const INDEX_VERSION = 2;
const SAVE_INDEX_EVERY_N = 10;

interface IndexedFile {
  [key: string]: string;
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string;
}

interface StoredIndex {
  version: number;
  indexedIds: string[];
}

export const useFileSearchStore = defineStore<'fileSearch', FileSearchStore>('fileSearch', () => {
  let processedCount = 0;
  const index = new Document<IndexedFile>({
    document: {
      id: 'id',
      index: ['title', 'description', 'content', 'tags'],
      store: ['id'],
    },
    tokenize: 'forward',
    cache: true,
    context: true,
  });

  const indexedIds = new Set<string>();
  const isSearching = ref(false);
  const isIndexing = ref(false);
  const lastSearchResult = ref<FileSearchStore['lastSearchResult']['value']>(null);

  const indexStats = computed(() => ({
    indexed: indexedIds.size,
    total: indexedIds.size,
  }));

  const addToIndex = (file: FileMeta, content: string, headings?: string[]): void => {
    if (!file.id) return;

    if (indexedIds.has(file.id)) {
      index.remove(file.id);
    }

    const headingsText = headings?.join(' ') ?? '';
    const searchableContent = `${content} ${headingsText}`;

    index.add({
      id: file.id,
      title: file.title ?? '',
      description: file.description ?? '',
      content: searchableContent,
      tags: file.tags?.join(' ') ?? '',
    });

    indexedIds.add(file.id);
  };

  const removeFromIndex = (id: string): void => {
    index.remove(id);
    indexedIds.delete(id);
  };

  const extractIdsFromResults = (
    results: EnrichedDocumentSearchResults<IndexedFile>,
  ): string[] => {
    const fileIds = new Set<string>();
    results.forEach((fieldResult) => {
      fieldResult.result.forEach((doc) => {
        fileIds.add(String(doc.id));
      });
    });
    return [...fileIds];
  };

  const performSearch = async (
    query: string,
    limit: number,
    offset: number,
  ): Promise<FileMeta[]> => {
    const results = index.search<false, false, true, true>(query, {
      limit: limit + offset,
      enrich: true,
    });

    const allIds = extractIdsFromResults(results);
    const paginatedIds = allIds.slice(offset, offset + limit);
    const files = await repositories.fileRepository.getByIds(paginatedIds);

    lastSearchResult.value = {
      files,
      total: allIds.length,
      query,
      searchedAt: Date.now(),
    };

    return files;
  };

  const search = async (
    query: string,
    options?: { limit?: number; offset?: number },
  ): Promise<FileMeta[]> => {
    const { limit = 20, offset = 0 } = options ?? {};

    if (!query.trim()) {
      lastSearchResult.value = null;
      return [];
    }

    isSearching.value = true;
    const result = await to(() => performSearch(query, limit, offset))();
    isSearching.value = false;

    if (result.isErr()) return [];
    return result.value;
  };

  const readPlainFile = async (filePath: string): Promise<string | null> => {
    const fs = useFileSystemStore();
    const raw = await fs.readFile(filePath, 'utf8');
    return raw as string | null;
  };

  const readEncryptedFile = async (filePath: string): Promise<string | null> => {
    const fs = useFileSystemStore();
    const encryption = useEncryptionStore();

    const raw = await fs.readFile(filePath, 'binary');
    if (!raw || !(raw instanceof Uint8Array)) return null;

    return encryption.decrypt(raw);
  };

  const readFileContent = async (filePath: string): Promise<string | null> => {
    if (isOrgGpgFile(filePath)) return readEncryptedFile(filePath);
    return readPlainFile(filePath);
  };

  interface ParsedFile {
    meta: FileMeta;
    headings: string[];
  }

  const parseFile = (content: string, filePath: string): ParsedFile => {
    const root = withMetaInfo(parse(content));
    const orgMeta = root.meta;

    const meta: FileMeta = {
      id: orgMeta.id ?? filePath,
      filePath: filePath.split('/').filter(Boolean),
      title: orgMeta.title,
      description: orgMeta.description,
      tags: orgMeta.fileTags,
      links: orgMeta.connectedNotes ? Object.keys(orgMeta.connectedNotes) : undefined,
      updatedAt: new Date().toISOString(),
    };

    const headings = orgMeta.headings?.map((h) => h.title) ?? [];

    return { meta, headings };
  };

  const processFile = async (filePath: string): Promise<void> => {
    const content = await readFileContent(filePath);
    if (!content) return;

    const { meta, headings } = parseFile(content, filePath);
    await repositories.fileRepository.save(meta);
    addToIndex(meta, content, headings);

    processedCount++;
    if (processedCount % SAVE_INDEX_EVERY_N !== 0) return;
    await saveIndex();
  };

  const resolveFileId = async (
    target: { id: string } | { path: string[] },
  ): Promise<string | undefined> => {
    if ('id' in target) return target.id;
    const file = await repositories.fileRepository.getByPath(target.path);
    return file?.id;
  };

  const removeFile = async (target: { id: string } | { path: string[] }): Promise<void> => {
    const id = await resolveFileId(target);
    if (!id) return;

    removeFromIndex(id);
    await repositories.fileRepository.delete(id);
  };

  const indexFile = async (filePath: string): Promise<void> => {
    const queue = useQueueStore();
    await queue.add({ filePath }, {}, INDEX_QUEUE_ID);
  };

  const buildEntryPath = (dirPath: string, name: string): string =>
    dirPath === '/' ? `/${name}` : `${dirPath}/${name}`;

  const shouldIndexFile = async (
    entryPath: string,
    lastIndexedAt: Date | null,
  ): Promise<boolean> => {
    const filePath = entryPath.split('/').filter(Boolean);
    const existing = await repositories.fileRepository.getByPath(filePath);

    if (!existing) return true;
    if (!indexedIds.has(existing.id)) return true;

    const fs = useFileSystemStore();
    const fileInfo = await fs.fileInfo(entryPath);
    if (!fileInfo) return false;

    const mtime = new Date(fileInfo.mtime);
    return !lastIndexedAt || mtime > lastIndexedAt;
  };

  const processEntry = async (
    entry: DiskFile,
    dirPath: string,
    lastIndexedAt: Date | null,
    scanDir: (path: string) => Promise<void>,
  ): Promise<void> => {
    const entryPath = buildEntryPath(dirPath, entry.name);

    if (entry.type === 'directory') {
      await scanDir(entryPath);
      return;
    }

    if (!isOrgFile(entry.name)) return;

    const needsIndex = await shouldIndexFile(entryPath, lastIndexedAt);
    if (!needsIndex) return;

    await indexFile(entryPath);
  };

  const performIndexing = async (): Promise<void> => {
    const fs = useFileSystemStore();
    const keyValueRepo = repositories.keyValueRepository;

    const lastIndexedAtStr = await keyValueRepo?.get(LAST_INDEXED_AT_KEY);
    const lastIndexedAt = lastIndexedAtStr ? new Date(lastIndexedAtStr) : null;

    const scanDir = async (dirPath: string): Promise<void> => {
      const entries = await fs.readDir(dirPath);
      if (!entries) return;

      for (const entry of entries) {
        await processEntry(entry, dirPath, lastIndexedAt, scanDir);
      }
    };

    await scanDir('/');
    await keyValueRepo?.set(LAST_INDEXED_AT_KEY, new Date().toISOString());
    await saveIndex();
  };

  const indexFiles = async (): Promise<void> => {
    isIndexing.value = true;
    await to(performIndexing)();
    isIndexing.value = false;
    processedCount = 0;
  };

  const saveIndex = async (): Promise<void> => {
    const keyValueRepo = repositories.keyValueRepository;
    if (!keyValueRepo) return;

    const data: StoredIndex = { version: INDEX_VERSION, indexedIds: [...indexedIds] };
    await keyValueRepo.set(FILE_INDEX_KEY, JSON.stringify(data));
  };

  const parseStoredIndex = (stored: string): StoredIndex | null => {
    const result = to(JSON.parse)(stored);
    if (result.isErr()) return null;

    const parsed = result.value as StoredIndex;
    if (parsed.version !== INDEX_VERSION) return null;
    if (!parsed.indexedIds?.length) return null;

    return parsed;
  };

  const loadFileIntoIndex = async (file: FileMeta): Promise<void> => {
    const fs = useFileSystemStore();
    const filePath = '/' + file.filePath.join('/');
    const content = await fs.readFile(filePath, 'utf8');

    if (!content || typeof content !== 'string') return;

    const { headings } = parseFile(content, filePath);
    addToIndex(file, content, headings);
  };

  const loadIndex = async (): Promise<boolean> => {
    const keyValueRepo = repositories.keyValueRepository;
    if (!keyValueRepo) return false;

    const stored = await keyValueRepo.get(FILE_INDEX_KEY);
    if (!stored) return false;

    const parsed = parseStoredIndex(stored);
    if (!parsed) return false;

    const files = await repositories.fileRepository.getByIds(parsed.indexedIds);

    for (const file of files) {
      await loadFileIntoIndex(file);
    }

    return indexedIds.size > 0;
  };

  const clearIndex = async (): Promise<void> => {
    const keyValueRepo = repositories.keyValueRepository;
    if (keyValueRepo) {
      await keyValueRepo.delete(FILE_INDEX_KEY);
    }

    [...indexedIds].forEach((id) => index.remove(id));
    indexedIds.clear();
  };

  return {
    isSearching,
    isIndexing,
    lastSearchResult,
    indexStats,
    search,
    indexFile,
    indexFiles,
    processFile,
    removeFile,
    loadIndex,
    saveIndex,
    clearIndex,
  };
});
