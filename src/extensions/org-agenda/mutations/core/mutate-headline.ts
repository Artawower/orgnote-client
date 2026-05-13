import { logger } from 'src/boot/logger';
import { parseHeadlineContext } from './headline-context';
import { applyTextEdits } from './text-edits';
import type { HeadlineContext } from './headline-context';
import type { TextEdit } from './text-edits';

export type HeadlineMutationBuilder = (ctx: HeadlineContext) => TextEdit | TextEdit[] | undefined;

const collectEdits = (ctx: HeadlineContext, builders: HeadlineMutationBuilder[]): TextEdit[] =>
  builders.flatMap((build) => {
    const result = build(ctx);
    if (!result) return [];
    return Array.isArray(result) ? result : [result];
  });

export const mutateHeadline = (
  content: string,
  headlineStart: number,
  builders: HeadlineMutationBuilder[],
): string | undefined => {
  const ctx = parseHeadlineContext(content, headlineStart);
  if (!ctx) {
    logger.warn('[agenda] mutateHeadline: parseHeadlineContext returned undefined', {
      headlineStart,
      contentPreview: content.slice(0, 200),
    });
    return undefined;
  }
  const edits = collectEdits(ctx, builders);
  logger.info('[agenda] mutateHeadline: collected edits', {
    headlineStart,
    editsCount: edits.length,
    edits: edits.map((edit) => ({
      start: edit.start,
      end: edit.end,
      replPreview: edit.replacement.slice(0, 30),
    })),
  });
  if (!edits.length) return content;
  try {
    return applyTextEdits(content, edits);
  } catch (error) {
    logger.error('[agenda] mutateHeadline: applyTextEdits threw', { error });
    return undefined;
  }
};
