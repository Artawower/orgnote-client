const OPENABLE_EXTERNAL_URL_PROTOCOLS = new Set(['http:', 'https:']);
const EXTERNAL_URL_TARGET = '_blank';
const EXTERNAL_URL_FEATURES = 'noopener,noreferrer';

export const toOpenableExternalUrl = (url: string): URL | undefined => {
  const value = url.trim();
  if (!URL.canParse(value)) return undefined;
  const parsed = new URL(value);
  return OPENABLE_EXTERNAL_URL_PROTOCOLS.has(parsed.protocol) ? parsed : undefined;
};

export const isOpenableExternalUrl = (url: string): boolean => Boolean(toOpenableExternalUrl(url));

export const openExternalUrl = (url: string): void => {
  const parsed = toOpenableExternalUrl(url);
  if (!parsed) return;
  window.open(parsed.toString(), EXTERNAL_URL_TARGET, EXTERNAL_URL_FEATURES);
};
