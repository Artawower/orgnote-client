const PATH_DILIMITER_SLASH = '/';

export function getFileDirPath(filePath: string | string[]): string {
  const path = (
    typeof filePath === 'string'
      ? filePath.split(PATH_DILIMITER_SLASH)
      : filePath
  )
    // TODO: feat/native-file-sync delete?
    // .filter((fp) => !!fp && fp != PATH_DILIMITER_SLASH)
    .slice(0, -1)
    .join('/');

  return path;
}
