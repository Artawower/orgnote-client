export type TagContext = 'headline-title' | 'filetags-keyword' | 'inline-body';

export interface TagRange {
  from: number;
  to: number;
  tag: string;
}

const HEADLINE_TRAILING_TAGS = /\s(:([\p{L}\p{N}_@#%]+:)+)\s*$/mu;
const INLINE_BODY_TAG_CHAIN = /(?:(?<=\s)|^)(:([\p{L}\p{N}_@#%]+:)+)(?=\s|$)/gmu;

const COLON_LENGTH = 1;
const LEADING_SPACE_LENGTH = 1;

const splitChain = (chainText: string, chainStart: number): TagRange[] => {
  const ranges: TagRange[] = [];
  const parts = chainText.slice(1, -1).split(':');
  let offset = COLON_LENGTH;
  for (const part of parts) {
    if (part.length > 0) {
      ranges.push({
        from: chainStart + offset - COLON_LENGTH,
        to: chainStart + offset + part.length + COLON_LENGTH,
        tag: part,
      });
    }
    offset += part.length + COLON_LENGTH;
  }
  return ranges;
};

const findHeadlineTitleTagRanges = (text: string): TagRange[] => {
  const ranges: TagRange[] = [];
  const lines = text.split('\n');
  let lineStart = 0;

  for (const line of lines) {
    const match = HEADLINE_TRAILING_TAGS.exec(line);
    if (match?.[1]) {
      const chainStart = lineStart + match.index + LEADING_SPACE_LENGTH;
      ranges.push(...splitChain(match[1], chainStart));
    }
    lineStart += line.length + 1;
  }

  return ranges;
};

const findInlineBodyTagRanges = (text: string): TagRange[] => {
  const ranges: TagRange[] = [];
  INLINE_BODY_TAG_CHAIN.lastIndex = 0;
  for (const match of text.matchAll(INLINE_BODY_TAG_CHAIN)) {
    const chain = match[1];
    if (!chain) continue;
    const chainOffset = match[0].length - chain.length;
    ranges.push(...splitChain(chain, match.index + chainOffset));
  }
  return ranges;
};

export const findOrgTagRanges = (text: string, context: TagContext): TagRange[] => {
  if (context === 'headline-title') return findHeadlineTitleTagRanges(text);
  return findInlineBodyTagRanges(text);
};
