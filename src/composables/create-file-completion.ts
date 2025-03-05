import { I18N, isOrgFile, type DiskFile, type OrgNoteApi } from 'orgnote-api';
import { ORG_EXTENSION } from 'src/constants/org-file-extension';
import { createDirPath } from 'src/utils/create-dir-path';
import { dirItemsGetter } from 'src/utils/dir-items-getter';

export const createFileCompletion = async (api: OrgNoteApi): Promise<string> => {
  const fm = api.core.useFileManager();
  let filePath = await getNewFileName(api, fm.focusDirPath);

  if (!filePath) {
    return;
  }

  if (!isOrgFile(filePath)) {
    filePath += `.${ORG_EXTENSION}`;
  }
  const fs = api.core.useFileSystem();
  await fs.writeFile(filePath, '');
  return filePath;
};

const getNewFileName = async (api: OrgNoteApi, filePath: string): Promise<string> => {
  const completion = api.core.useCompletion();

  return await completion.open<DiskFile, string>({
    type: 'input-choice',
    searchText: createDirPath(filePath),
    placeholder: I18N.FILE_NAME,
    itemsGetter: (filter) => dirItemsGetter(api, filter),
  });
};
