export function textToKebab(text: string): string {
  return text.replace(/\ /g, '-').toLowerCase();
}
