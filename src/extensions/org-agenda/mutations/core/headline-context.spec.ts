import { expect, test } from 'vitest';
import { parse, withMetaInfo } from 'org-mode-ast';
import { extractFileTasks } from 'src/utils/extract-file-tasks';
import { parseHeadlineContext } from './headline-context';

test('parseHeadlineContext_singleLevelHeading_finds', () => {
  const content = '* TODO Task\n';
  const meta = withMetaInfo(parse(content));
  const heading = meta.meta?.headings?.[0];

  const ctx = parseHeadlineContext(content, heading!.start);

  expect(ctx).toBeDefined();
  expect(ctx?.heading?.todoKeyword).toBe('TODO');
});

test('parseHeadlineContext_levelTwoHeading_findsHeadlineByMetaStart', () => {
  const content = '* Parent\n** TODO Day reflection\nSCHEDULED: <2026-05-12 Tue +1d>\n';
  const meta = withMetaInfo(parse(content));
  const heading = meta.meta?.headings?.find((item) => item.todoKeyword === 'TODO');

  expect(heading).toBeDefined();
  const ctx = parseHeadlineContext(content, heading!.start);

  expect(ctx).toBeDefined();
  expect(ctx?.heading?.todoKeyword).toBe('TODO');
});

test('parseHeadlineContext_levelTwoFromExtractFileTasks_finds', () => {
  const content = '* Parent\n** TODO Day reflection\nSCHEDULED: <2026-05-12 Tue +1d>\n';
  const root = withMetaInfo(parse(content));
  const task = extractFileTasks(root, '/agenda.org').find((item) => item.text === 'Day reflection');

  expect(task).toBeDefined();
  const ctx = parseHeadlineContext(content, task!.start!);

  expect(ctx).toBeDefined();
  expect(ctx?.heading?.todoKeyword).toBe('TODO');
});

test('parseHeadlineContext_levelTwoTodoKeywordOffset_findsContainingHeadline', () => {
  const content = '* Parent\n** TODO Day reflection\nSCHEDULED: <2026-05-12 Tue +1d>\n';
  const todoKeywordStart = content.indexOf('TODO');

  const ctx = parseHeadlineContext(content, todoKeywordStart);

  expect(ctx).toBeDefined();
  expect(ctx?.headline.start).toBe(content.indexOf('** TODO'));
  expect(ctx?.heading?.todoKeyword).toBe('TODO');
});
