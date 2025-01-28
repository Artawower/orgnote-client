export function extractFileNameFromPath(path?: string): string {
  if (!path) {
    return path;
  }
  return path.split('/').pop();
}
