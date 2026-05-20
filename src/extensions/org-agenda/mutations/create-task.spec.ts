import { expect, test } from 'vitest';
import { createTask } from './create-task';

test('createTask_createsFirstHeadline_inEmptyFile', () => {
  const result = createTask('', { title: 'Buy milk' });
  expect(result).toBe('* TODO Buy milk\n');
});

test('createTask_includesPriorityMark_whenPrioritySet', () => {
  const result = createTask('', { title: 'Buy milk', priority: 'A' });
  expect(result).toBe('* TODO [#A] Buy milk\n');
});

test('createTask_omitsPriorityMark_whenPriorityAbsent', () => {
  const result = createTask('', { title: 'Buy milk' });
  expect(result).not.toContain('[#');
});

test('createTask_supportsPriorityB_andC', () => {
  expect(createTask('', { title: 'Task', priority: 'B' })).toBe('* TODO [#B] Task\n');
  expect(createTask('', { title: 'Task', priority: 'C' })).toBe('* TODO [#C] Task\n');
});

test('createTask_appendsHeadline_afterTrailingNewline', () => {
  const result = createTask('* TODO Existing\n', { title: 'New task' });
  expect(result).toBe('* TODO Existing\n* TODO New task\n');
});

test('createTask_appendsBody_inSection', () => {
  const result = createTask('', { title: 'Task', body: 'Details here' });
  expect(result).toContain('* TODO Task\n');
  expect(result).toContain('Details here\n');
});

test('createTask_appendsScheduled_inPlanning', () => {
  const result = createTask('', { title: 'Task', scheduledDate: '2026-05-16' });
  expect(result).toContain('SCHEDULED: <2026-05-16');
});

test('createTask_trimsTitle', () => {
  const result = createTask('', { title: '  spaces  ' });
  expect(result).toBe('* TODO spaces\n');
});

test('createTask_usesCustomTodoKeyword', () => {
  const result = createTask('', { title: 'Task', todoKeyword: 'HOLD' });
  expect(result).toContain('* HOLD Task');
});

test('createTask_appendsAfterWhitespaceOnlyContent', () => {
  const result = createTask('   \n', { title: 'Task' });
  expect(result).toBe('* TODO Task\n');
});

test('createTask_scheduledIsoDate_appliesLocalDayName', () => {
  const result = createTask('', { title: 'Task', scheduledDate: '2026-05-17' });
  expect(result).toMatch(/SCHEDULED: <2026-05-17 \w{3}>/);
});

test('createTask_keepsInlineOrgTags_inTitle', () => {
  const result = createTask('', { title: 'Task :work:home:' });
  expect(result).toBe('* TODO Task :work:home:\n');
});

test('createTask_promotesLevel1Headlines_inBody', () => {
  const result = createTask('', { title: 'Task', body: 'some text\n* foo\nmore text' });
  expect(result).toContain('** foo');
  expect(result).not.toContain('\n* foo');
});

test('createTask_keepsLevel2Headlines_inBody', () => {
  const result = createTask('', { title: 'Task', body: '** existing subtask' });
  expect(result).toContain('** existing subtask');
});

test('createTask_handlesMixedHeadlineLevels_inBody', () => {
  const result = createTask('', { title: 'Task', body: '* one\n** two\n*** three' });
  expect(result).toContain('** one');
  expect(result).toContain('** two');
  expect(result).toContain('*** three');
});

test('createTask_includesBothBodyAndScheduled', () => {
  const result = createTask('', { title: 'Task', body: 'Notes', scheduledDate: '2026-05-20' });
  expect(result).toContain('* TODO Task\n');
  expect(result).toContain('SCHEDULED:');
  expect(result).toContain('Notes\n');
});
