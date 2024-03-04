export function extractDomain(url?: string): string {
  if (!url) {
    return '';
  }
  const match = url.match(
    /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim
  );
  return match
    ? match[0].replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?/gim, '')
    : '';
}
