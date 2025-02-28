import { join } from 'orgnote-api';
import { rootSystemFilePath } from 'src/constants/root-system-file-path';

export function getSystemFilesPath(path: string | string[]): string {
  const normalizedPath = typeof path === 'string' ? path : join(...path);

  return `${rootSystemFilePath}/${normalizedPath}`;
}
