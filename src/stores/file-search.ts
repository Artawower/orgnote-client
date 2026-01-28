import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Document, type EnrichedDocumentSearchResults } from 'flexsearch';
import type { DiskFile, FileMeta, FileSearchStore, FileIndexMeta, StoredIndex } from 'orgnote-api';
import { isOrgFile, isOrgGpgFile, to } from 'orgnote-api';
import { parse, withMetaInfo } from 'org-mode-ast';
import { repositories } from 'src/boot/repositories';
import { useQueueStore } from 'src/stores/queue';
import { useFileSystemStore } from 'src/stores/file-system';
import { useEncryptionStore } from 'src/stores/encryption';
import { INDEX_QUEUE_ID } from 'src/constants/queue-ids';
import { logger } from 'src/boot/logger';

const FILE_INDEX_KEY = 'file-index';
const INDEX_VERSION = 3;
const SAVE_INDEX_EVERY_N = 10;

interface IndexedFile {
  [key: string]: string;
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string;
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
  const indexMetaMap = new Map<string, FileIndexMeta>();
  const isSearching = ref(false);
  const isIndexing = ref(false);
  const lastSearchResult = ref<FileSearchStore['lastSearchResult']['value']>(null);

  const indexStats = computed(() => ({
    indexed: indexedIds.size,
    total: indexedIds.size,
  }));

  const addToIndex = (file: FileMeta, content: string): void => {
    if (!file.id) return;

    if (indexedIds.has(file.id)) {
      index.remove(file.id);
    }

    index.add({
      id: file.id,
      title: file.title ?? '',
      description: file.description ?? '',
      content,
      tags: file.tags?.join(' ') ?? '',
    });

    indexedIds.add(file.id);
  };

  const removeFromIndex = (id: string): void => {
    index.remove(id);
    indexedIds.delete(id);
    indexMetaMap.delete(id);
  };

  const updateIndexMeta = async (fileId: string, filePath: string): Promise<void> => {
    const mtime = await getFileMtime(filePath);
    if (!mtime) return;

    const meta: FileIndexMeta = {
      id: fileId,
      indexedAt: new Date().toISOString(),
      fileModifiedAt: mtime.toISOString(),
    };

    indexMetaMap.set(fileId, meta);
  };

  const extractIdsFromResults = (results: EnrichedDocumentSearchResults<IndexedFile>): string[] => {
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

  const parseFile = (content: string, filePath: string): FileMeta => {
    const root = withMetaInfo(parse(content));
    const orgMeta = root.meta;

    return {
      id: orgMeta.id ?? filePath,
      filePath: filePath.split('/').filter(Boolean),
      title: orgMeta.title,
      description: orgMeta.description,
      tags: orgMeta.fileTags,
      links: orgMeta.connectedNotes ? Object.keys(orgMeta.connectedNotes) : undefined,
      updatedAt: new Date().toISOString(),
    };
  };

  const processFile = async (filePath: string): Promise<void> => {
    const content = await readFileContent(filePath);
    if (!content) return;

    const meta = parseFile(content, filePath);
    await repositories.fileRepository.save(meta);
    addToIndex(meta, content);
    await updateIndexMeta(meta.id, filePath);

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

  const buildIndexTaskId = (filePath: string): string => `file:${filePath}`;

  const hasQueuedIndexTask = async (taskId: string): Promise<boolean> => {
    const queueRepository = repositories.queueRepository;
    if (!queueRepository) return false;

    const existing = await queueRepository.get(taskId);
    if (!existing) return false;
    if (existing.queueId !== INDEX_QUEUE_ID) return false;
    if (existing.deletedAt) return false;
    return true;
  };

  const enqueueIndexTask = async (
    queue: ReturnType<typeof useQueueStore>,
    filePath: string,
  ): Promise<void> => {
    const taskId = buildIndexTaskId(filePath);
    const alreadyQueued = await hasQueuedIndexTask(taskId);

    if (alreadyQueued) {
      logger.debug('search index skip existing queued task', { filePath, taskId });
      return;
    }

    await queue.add(INDEX_QUEUE_ID, { filePath }, { id: taskId });
  };

  const indexFile = async (filePath: string): Promise<void> => {
    const shouldIndexResult = await to(() => shouldIndexFile(filePath))();
    if (shouldIndexResult.isErr()) {
      logger.error('search index failed to check if file needs indexing', {
        filePath,
        error: shouldIndexResult.error,
      });
      return;
    }
    if (!shouldIndexResult.value) return;

    const queue = useQueueStore();
    await enqueueIndexTask(queue, filePath);
  };

  const buildEntryPath = (dirPath: string, name: string): string =>
    dirPath === '/' ? `/${name}` : `${dirPath}/${name}`;

  const getFileMtime = async (entryPath: string): Promise<Date | null> => {
    const fs = useFileSystemStore();
    const fileInfo = await fs.fileInfo(entryPath);
    if (!fileInfo) return null;
    return new Date(fileInfo.mtime);
  };

  const shouldIndexFile = async (entryPath: string): Promise<boolean> => {
    const filePath = entryPath.split('/').filter(Boolean);
    const existing = await repositories.fileRepository.getByPath(filePath);

    if (!existing) return true;
    if (!indexedIds.has(existing.id)) return true;

    const meta = indexMetaMap.get(existing.id);
    if (!meta) return true;

    const currentMtime = await getFileMtime(entryPath);
    if (!currentMtime) return false;

    const storedMtime = new Date(meta.fileModifiedAt).getTime();
    const needsIndex = currentMtime.getTime() > storedMtime;

    if (!needsIndex) {
      logger.debug('search index skip unchanged file', {
        filePath: entryPath,
        fileId: existing.id,
        fileModifiedAt: meta.fileModifiedAt,
      });
    }

    return needsIndex;
  };

  const readDirectoryEntries = async (dirPath: string): Promise<DiskFile[] | null> => {
    const fs = useFileSystemStore();
    const readResult = await to(() => fs.readDir(dirPath))();

    if (readResult.isErr()) {
      logger.error('search index failed to read directory', { dirPath, error: readResult.error });
      return null;
    }

    return readResult.value ?? null;
  };

  const scanSubdirectory = async (
    entryPath: string,
    queue: ReturnType<typeof useQueueStore>,
  ): Promise<void> => {
    const scanResult = await to(() => scanDirectory(entryPath, queue))();
    if (scanResult.isOk()) return;

    logger.error('search index failed to scan directory', {
      dirPath: entryPath,
      error: scanResult.error,
    });
  };

  const scanFileEntry = async (
    entryPath: string,
    entry: DiskFile,
    queue: ReturnType<typeof useQueueStore>,
  ): Promise<void> => {
    if (!isOrgFile(entry.name)) return;

    const shouldIndexResult = await to(() => shouldIndexFile(entryPath))();
    if (shouldIndexResult.isErr()) {
      logger.error('search index failed to check if file needs indexing', {
        filePath: entryPath,
        error: shouldIndexResult.error,
      });
      return;
    }

    if (!shouldIndexResult.value) return;

    await enqueueIndexTask(queue, entryPath);
  };

  const scanEntry = async (
    dirPath: string,
    entry: DiskFile,
    queue: ReturnType<typeof useQueueStore>,
  ): Promise<void> => {
    const entryPath = buildEntryPath(dirPath, entry.name);

    if (entry.type === 'directory') {
      await scanSubdirectory(entryPath, queue);
      return;
    }

    await scanFileEntry(entryPath, entry, queue);
  };

  const scanDirectory = async (
    dirPath: string,
    queue: ReturnType<typeof useQueueStore>,
  ): Promise<void> => {
    const entries = await readDirectoryEntries(dirPath);
    if (!entries) return;

    await Promise.all(entries.map((entry) => scanEntry(dirPath, entry, queue)));
  };

  const ensureIndexLoaded = async (): Promise<void> => {
    if (indexedIds.size > 0) return;
    const loaded = await loadIndex();
    if (loaded) return;
    indexMetaMap.clear();
  };

  const performIndexing = async (): Promise<void> => {
    const queue = useQueueStore();
    await ensureIndexLoaded();
    await scanDirectory('/', queue);
    logger.info(`File indexing scan completed, added files to queue`);
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

    const files: Record<string, FileIndexMeta> = {};
    indexMetaMap.forEach((meta, id) => {
      if (indexedIds.has(id)) {
        files[id] = meta;
      }
    });

    const data: StoredIndex = {
      version: INDEX_VERSION,
      files,
    };

    await keyValueRepo.set(FILE_INDEX_KEY, JSON.stringify(data));
  };

  const loadFileIntoIndex = async (file: FileMeta, meta: FileIndexMeta): Promise<void> => {
    const fs = useFileSystemStore();
    const filePath = '/' + file.filePath.join('/');
    const content = await fs.readFile(filePath, 'utf8');

    if (!content || typeof content !== 'string') return;

    addToIndex(file, content);
    indexMetaMap.set(file.id, meta);
  };

  const loadIndex = async (): Promise<boolean> => {
    const keyValueRepo = repositories.keyValueRepository;
    if (!keyValueRepo) return false;

    const stored = await keyValueRepo.get(FILE_INDEX_KEY);
    if (!stored) return false;

    const result = to(JSON.parse)(stored);
    if (result.isErr()) return false;

    const parsed = result.value as StoredIndex;
    if (parsed.version !== INDEX_VERSION) return false;

    const entries = Object.entries(parsed.files);
    const fileIds = entries.map(([id]) => id);
    const files = await repositories.fileRepository.getByIds(fileIds);

    for (const file of files) {
      const meta = parsed.files[file.id];
      if (meta) {
        await loadFileIntoIndex(file, meta);
      }
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
    indexMetaMap.clear();
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
