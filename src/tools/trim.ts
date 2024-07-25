export function trim(text: string, length: number, end = '...') {
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length) + end;
}
