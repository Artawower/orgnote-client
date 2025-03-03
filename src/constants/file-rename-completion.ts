import type { CompletionSearchResult, DiskFile } from 'orgnote-api';
import { getParentDir, I18N, type OrgNoteApi } from 'orgnote-api';
import type { IFuseOptions } from 'fuse.js';
import Fuse from 'fuse.js';

const fuseOptions: IFuseOptions<DiskFile> = {
  threshold: 0.4,
  keys: ['path'],
};

export const useFileRenameCompletion = async (
  api: OrgNoteApi,
  filePath: string,
): Promise<string> => {
  const result = await getNewFileName(api, filePath);
  const filePathDoesNotChanged = filePath === result;

  if (filePathDoesNotChanged) {
    return;
  }

  const fm = api.core.useFileSystem();
  await fm.rename(filePath, result);
};

const getNewFileName = async (api: OrgNoteApi, filePath: string) => {
  const completion = api.core.useCompletion();
  return await completion.open<DiskFile, string>({
    type: 'input-choice',
    searchText: filePath,
    placeholder: I18N.RENAME_FILE,
    itemsGetter: (filter) => dirItemsGetter(api, filter),
  });
};

const dirItemsGetter = async (api: OrgNoteApi, filter: string) => {
  const fs = api.core.useFileSystem();
  const fileInfo = await fs.fileInfo(filter);

  const isFilterNotRoot = filter !== '/';
  const isFile = fileInfo?.type === 'file';

  if (isFilterNotRoot && isFile) {
    return { total: 0, result: [] };
  }
  const parentPath = getParentDir(filter);
  const dirs = (await fs.readDir(parentPath)).filter((f) => f.type === 'directory');
  const fuse = new Fuse(dirs, fuseOptions);
  const matchedDirs = fuse.search(filter).map((r) => r.item);

  const res: CompletionSearchResult<DiskFile> = {
    total: matchedDirs?.length || 0,
    result: matchedDirs.map((dir) => ({
      icon: 'sym_o_folder',
      title: dir.path,
      data: dir,
      commandHandler: () => {
        return;
      },
    })),
  };

  return res;
};
