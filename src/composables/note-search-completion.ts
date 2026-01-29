import type {
  FileMeta,
  OrgNoteApi,
  CompletionSearchResult,
  CompletionCandidate,
} from 'orgnote-api';
import { I18N, join } from 'orgnote-api';
import { unref } from 'vue';

const getFileName = (filePath: string[]): string => filePath.at(-1) ?? 'Untitled';

const fileToCandidate = (
  file: FileMeta,
  bufferViewer: ReturnType<OrgNoteApi['core']['useBufferViewer']>,
  completion: ReturnType<OrgNoteApi['core']['useCompletion']>,
): CompletionCandidate<FileMeta> => ({
  icon: 'sym_o_description',
  title: file.title ?? getFileName(file.filePath),
  description: formatDescription(file),
  data: file,
  commandHandler: () => {
    bufferViewer.open(join('/', ...file.filePath));
    completion.close();
  },
});

const searchFiles = async (
  api: OrgNoteApi,
  filter: string,
  limit?: number,
  offset?: number,
): Promise<CompletionSearchResult<FileMeta>> => {
  const fileSearch = api.core.useFileSearch();
  const bufferViewer = api.core.useBufferViewer();
  const completion = api.core.useCompletion();

  const files = await fileSearch.search(filter, { limit, offset });
  const lastResult = unref(fileSearch.lastSearchResult);
  const isMatchingQuery = lastResult?.query === filter;

  return {
    total: isMatchingQuery ? lastResult.total : files.length,
    result: files.map((file) => fileToCandidate(file, bufferViewer, completion)),
  };
};

const getRecentFiles = async (
  api: OrgNoteApi,
  limit?: number,
  offset?: number,
): Promise<CompletionSearchResult<FileMeta>> => {
  const fileMeta = api.core.useFileMeta();
  const bufferViewer = api.core.useBufferViewer();
  const completion = api.core.useCompletion();

  const files = await fileMeta.getAll({ limit, offset });
  const total = await fileMeta.count();

  return {
    total,
    result: files.map((file) => fileToCandidate(file, bufferViewer, completion)),
  };
};

const createSearchItemsGetter = (api: OrgNoteApi) => {
  return async (
    filter: string,
    limit?: number,
    offset?: number,
  ): Promise<CompletionSearchResult<FileMeta>> => {
    if (!filter.trim()) {
      return getRecentFiles(api, limit, offset);
    }
    return searchFiles(api, filter, limit, offset);
  };
};

const formatDescription = (file: FileMeta): string => {
  const parts: string[] = [];

  if (file.description) {
    parts.push(file.description);
  }

  if (file.tags?.length) {
    parts.push(file.tags.map((t) => `#${t}`).join(' '));
  }

  return parts.join('\n');
};

export const useNoteSearchCompletion = async (
  api: OrgNoteApi,
  searchText: string = '',
): Promise<void> => {
  const completion = api.core.useCompletion();

  await completion.open<FileMeta, void>({
    type: 'choice',
    searchText,
    placeholder: I18N.SEARCH,
    itemsGetter: createSearchItemsGetter(api),
  });
};
