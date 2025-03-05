import type { DiskFile } from 'orgnote-api';
import { I18N, type OrgNoteApi } from 'orgnote-api';
import { dirItemsGetter } from 'src/utils/dir-items-getter';

export const useFileRenameCompletion = async (
  api: OrgNoteApi,
  filePath: string,
): Promise<string> => {
  const result = await getNewFileName(api, filePath);
  const filePathDoesNotChanged = filePath === result || !result;

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
