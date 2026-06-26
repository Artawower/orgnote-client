import Fuse from 'fuse.js';
import type { DiskFile, OrgNoteApi, CompletionSearchResult } from 'orgnote-api';

export type ReadDirFn = (path: string) => Promise<DiskFile[]>;

export interface DirItemsGetterOptions {
  includeFiles?: boolean;
  rootPath?: string;
  allowedExtensions?: string[];
  recursive?: boolean;
}

const matchesAllowedExtension = (path: string, allowedExtensions?: string[]): boolean => {
  if (!allowedExtensions?.length) return true;
  return allowedExtensions.some((extension) => path.endsWith(extension));
};

const shouldIncludeItem = (
  item: DiskFile,
  includeFiles: boolean,
  allowedExtensions?: string[],
): boolean => {
  if (item.type === 'directory') return true;
  return includeFiles && matchesAllowedExtension(item.path, allowedExtensions);
};

export const walkDir = async (
  readDir: ReadDirFn,
  path: string,
  includeFiles: boolean,
  allowedExtensions?: string[],
  recursive = true,
): Promise<DiskFile[]> => {
  const items = await readDir(path);
  const included = items.filter((item) => shouldIncludeItem(item, includeFiles, allowedExtensions));

  if (!recursive) return included;

  const nestedGroups = await Promise.all(
    items
      .filter((item) => item.type === 'directory')
      .map((item) => walkDir(readDir, item.path, includeFiles, allowedExtensions, recursive)),
  );

  return [...included, ...nestedGroups.flat()];
};

const resolveOptions = (options: boolean | DirItemsGetterOptions): Required<DirItemsGetterOptions> => {
  if (typeof options === 'boolean') {
    return {
      includeFiles: options,
      rootPath: '/',
      allowedExtensions: [],
      recursive: true,
    };
  }

  return {
    includeFiles: options.includeFiles ?? false,
    rootPath: options.rootPath ?? '/',
    allowedExtensions: options.allowedExtensions ?? [],
    recursive: options.recursive ?? true,
  };
};

export const createDirItemsGetter = (
  api: OrgNoteApi,
  options: boolean | DirItemsGetterOptions = false,
) => {
  let allFiles: DiskFile[] | null = null;
  let fuse: Fuse<DiskFile> | null = null;
  const completion = api.core.useCompletion();
  const resolvedOptions = resolveOptions(options);

  return async (filter: string): Promise<CompletionSearchResult<DiskFile>> => {
    const fs = api.core.useFileSystem();

    if (!allFiles) {
      allFiles = await walkDir(
        fs.readDir,
        resolvedOptions.rootPath,
        resolvedOptions.includeFiles,
        resolvedOptions.allowedExtensions,
        resolvedOptions.recursive,
      );
      const threshold = api.core.useConfig().config.completion.fuseThreshold;
      fuse = new Fuse(allFiles, { threshold, keys: ['name', 'path'] });
    }

    const results = filter ? fuse!.search(filter).map((r) => r.item) : allFiles;

    return {
      total: results.length,
      result: results.map((item) => ({
        icon: item.type === 'directory' ? 'sym_o_folder' : 'sym_o_description',
        title: item.type === 'directory' ? `${item.path}/` : item.path,
        data: item,
        commandHandler: (file: DiskFile) => {
          void completion.close(file.type === 'directory' ? `${file.path}/` : file.path);
        },
      })),
    };
  };
};
