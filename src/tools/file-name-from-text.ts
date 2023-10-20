import { textToKebab } from './text-to-kebab';

export function getFileNameFromText(text: string): string {
  const kebabedText = textToKebab(text);
  const withoutExtraChars = kebabedText.replace(/[^a-zA-Z0-9-]/g, '');
  return withoutExtraChars;
}
