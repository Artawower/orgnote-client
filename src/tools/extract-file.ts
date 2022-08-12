export function extractFileNameFromPath(path: string): string {
  return path.split('/').pop();
}

export function buildMediaFilePath(path: string): string {
  return `/media/${path}`;
}
