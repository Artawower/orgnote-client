import { fileBaseName } from 'src/utils/file-path';

const TILDE_PATTERN = /~([^\s]+)/g;
const TAG_PATTERN = /:(\w+):/g;

export interface ParsedQuickAdd {
  title: string;
  body?: string;
  targetFile?: string;
  tags?: string[];
}

const splitLines = (raw: string): [string, string | undefined] => {
  const idx = raw.indexOf('\n');
  if (idx === -1) return [raw, undefined];
  const body = raw.slice(idx + 1).trim();
  return [raw.slice(0, idx), body || undefined];
};

const findMatchingFile = (token: string, knownFiles: string[]): string | undefined =>
  knownFiles.find((f) => fileBaseName(f).toLowerCase() === token.toLowerCase());

const extractTags = (titleLine: string): { cleaned: string; tags: string[] } => {
  const tags: string[] = [];
  const cleaned = titleLine.replace(TAG_PATTERN, (_match, tag: string) => {
    tags.push(tag);
    return '';
  });
  return { cleaned, tags };
};

const resolveTildeMatches = (
  titleLine: string,
  knownFiles: string[],
): { title: string; targetFile?: string } => {
  let targetFile: string | undefined;
  const title = titleLine.replace(TILDE_PATTERN, (match, token: string) => {
    if (targetFile) return match;
    const found = findMatchingFile(token, knownFiles);
    if (!found) return match;
    targetFile = found;
    return '';
  });
  return { title: title.trim().replace(/\s{2,}/g, ' '), targetFile };
};

export const parseQuickAddInput = (raw: string, knownFiles: string[]): ParsedQuickAdd => {
  const [titleLine, body] = splitLines(raw);
  const { cleaned, tags } = extractTags(titleLine);
  const { title, targetFile } = resolveTildeMatches(cleaned, knownFiles);
  return {
    title,
    ...(body ? { body } : {}),
    ...(targetFile ? { targetFile } : {}),
    ...(tags.length ? { tags } : {}),
  };
};
