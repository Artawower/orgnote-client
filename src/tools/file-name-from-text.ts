import { textToKebab } from './text-to-kebab';

export function getFileNameFromText(text: string): string {
  const kebabedText = textToKebab(text);
  const withoutExtraChars = kebabedText.replace(/[^\p{L}\w0-9-]/gu, '');
  return withoutExtraChars;
}
