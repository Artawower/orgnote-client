export function extractFileNameFromPath(path: string): string {
  return path.split('/').pop();
}
