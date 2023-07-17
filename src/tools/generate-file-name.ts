export function generateFileName(title: string): string {
  return title.replaceAll(/\s/g, '-').toLowerCase() + '.org';
}
