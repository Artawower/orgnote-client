export function toKebabCase(text: string): string {
  return text.replace(/ /g, '-').toLowerCase();
}
