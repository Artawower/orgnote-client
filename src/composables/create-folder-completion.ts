import { I18N, type DiskFile, type OrgNoteApi } from 'orgnote-api';
import { dirItemsGetter } from 'src/utils/dir-items-getter';

export const createFolderCompletion = async (api: OrgNoteApi): Promise<string> => {
  const fm = api.core.useFileManager();
  const filePath = await getNewFolderName(api, fm.focusDirPath);

  if (!filePath) {
    return;
  }

  await fm.createFolder(filePath);
  return filePath;
};

const getNewFolderName = async (api: OrgNoteApi, filePath: string): Promise<string> => {
  const completion = api.core.useCompletion();

  return await completion.open<DiskFile, string>({
    type: 'input-choice',
    searchText: filePath,
    placeholder: I18N.FOLDER_NAME,
    itemsGetter: (filter) => dirItemsGetter(api, filter),
  });
};
