export function toCamelCase(text: string): string {
  return text.replace(/-\w/g, (m) => m[1].toUpperCase());
}

export function toKebabCase(text: string): string {
  return text.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}
