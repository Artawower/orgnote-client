import type { IFuseOptions } from 'fuse.js';
import Fuse from 'fuse.js';
import type { DiskFile, OrgNoteApi, CompletionSearchResult } from 'orgnote-api';
import { getParentDir } from 'orgnote-api';

const fuseOptions: IFuseOptions<DiskFile> = {
  threshold: 0.4,
  keys: ['path'],
};

export const dirItemsGetter = async (api: OrgNoteApi, filter: string) => {
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
  const completion = api.core.useCompletion();

  const res: CompletionSearchResult<DiskFile> = {
    total: matchedDirs?.length || 0,
    result: matchedDirs.map((dir) => ({
      icon: 'sym_o_folder',
      title: `${dir.path}/`,
      data: dir,
      commandHandler: (data: DiskFile) => {
        completion.activeCompletion.searchQuery = `${data.path}/`;
        return;
      },
    })),
  };

  return res;
};
