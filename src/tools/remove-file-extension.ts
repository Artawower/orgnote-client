export function removeFileExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '');
}
