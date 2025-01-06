import { join } from 'orgnote-api';

const rootSystemFilePath = '.orgnote';

export function getSystemFilesPath(path: string | string[]): string {
  const normalizedPath = typeof path === 'string' ? path : join(...path);

  return `${rootSystemFilePath}/${normalizedPath}`;
}
