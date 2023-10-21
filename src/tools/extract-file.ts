import { isUrl } from './is-url';

export function extractFileNameFromPath(path: string): string {
  return path.split('/').pop();
}

export function buildMediaFilePath(path: string, folder?: string): string {
  const fileName = extractFileNameFromPath(path);
  if (isUrl(path)) {
    return path;
  }
  folder = folder ? `${folder}/` : '';
  return `/media/${folder}${fileName}`;
}
