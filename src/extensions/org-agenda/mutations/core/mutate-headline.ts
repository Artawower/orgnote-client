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
  if (!ctx) return undefined;
  const edits = collectEdits(ctx, builders);
  if (!edits.length) return content;
  return applyTextEdits(content, edits);
};
