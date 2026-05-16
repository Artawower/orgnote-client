import type { DiskFile, OrgNoteApi, CompletionSearchResult } from 'orgnote-api';
import { walkDir } from 'src/utils/dir-items-getter';
import { fileBaseName } from 'src/utils/file-path';

const isOrgFile = (file: DiskFile): boolean => file.type === 'file' && file.path.endsWith('.org');

const matchesSearch = (file: DiskFile, search: string): boolean => {
  if (!search) return true;
  return fileBaseName(file.path).toLowerCase().includes(search.toLowerCase());
};

const isInboxFile = (file: DiskFile, inboxFileName: string): boolean =>
  file.path.endsWith(`/${inboxFileName}`) || file.path === inboxFileName;

const toCompletionCandidate = (
  file: DiskFile,
  completion: ReturnType<OrgNoteApi['core']['useCompletion']>,
) => ({
  icon: 'sym_o_description' as const,
  title: fileBaseName(file.path),
  description: file.path,
  data: file,
  commandHandler: (f: DiskFile) => completion.close(f.path),
});

export const createAgendaFilesGetter = (
  api: OrgNoteApi,
  agendaFilesPath: string,
  inboxFileName: string,
) => {
  let cachedFiles: DiskFile[] | null = null;
  const completion = api.core.useCompletion();

  return async (search: string): Promise<CompletionSearchResult<DiskFile>> => {
    if (!cachedFiles) {
      const fs = api.core.useFileSystem();
      const all = await walkDir(fs.readDir, agendaFilesPath || '/', true);
      cachedFiles = all.filter(isOrgFile);
    }

    const filtered = cachedFiles.filter((f) => matchesSearch(f, search));
    const inbox = filtered.filter((f) => isInboxFile(f, inboxFileName));
    const rest = filtered.filter((f) => !isInboxFile(f, inboxFileName));
    const sorted = [...inbox, ...rest];

    return {
      total: sorted.length,
      result: sorted.map((f) => toCompletionCandidate(f, completion)),
    };
  };
};
