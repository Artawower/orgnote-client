import { format, parseISO } from 'date-fns';
import { editOrgDocument } from 'orgnote-api/utils';

const PARENT_TASK_LEVEL = 1;
const MIN_SAFE_SUBTASK_LEVEL = PARENT_TASK_LEVEL + 1;

const promoteSubtaskHeadlines = (body: string): string => {
  if (!body.trim()) return body;
  return editOrgDocument(body, (doc) => {
    doc
      .headlines()
      .filter((h) => h.level < MIN_SAFE_SUBTASK_LEVEL)
      .forEach((h) => h.setLevel(MIN_SAFE_SUBTASK_LEVEL));
  });
};

export interface CreateTaskInput {
  title: string;
  body?: string;
  scheduledDate?: string;
  todoKeyword?: string;
  priority?: string;
}

const DEFAULT_TODO_KEYWORD = 'TODO';

const getDayName = (isoDate: string): string => format(parseISO(isoDate), 'EEE');

const normalizeContent = (content: string): string => {
  const trimmed = content.trimEnd();
  return trimmed ? `${trimmed}\n` : '';
};

const buildPriorityMark = (priority: string | undefined): string =>
  priority ? `[#${priority}] ` : '';

const buildHeadlineLine = (input: CreateTaskInput): string => {
  const keyword = input.todoKeyword ?? DEFAULT_TODO_KEYWORD;
  const priorityMark = buildPriorityMark(input.priority);
  return `* ${keyword} ${priorityMark}${input.title.trim()}\n`;
};

const buildScheduledLine = (date: string): string => `SCHEDULED: <${date} ${getDayName(date)}>\n`;

const buildPlanningBlock = (scheduledDate: string | undefined): string =>
  scheduledDate ? buildScheduledLine(scheduledDate) : '';

const buildBodyBlock = (body: string | undefined): string =>
  body ? `${promoteSubtaskHeadlines(body.trim())}\n` : '';

export const createTask = (content: string, input: CreateTaskInput): string => {
  const base = normalizeContent(content);
  const headline = buildHeadlineLine(input);
  const planning = buildPlanningBlock(input.scheduledDate);
  const body = buildBodyBlock(input.body);
  return `${base}${headline}${planning}${body}`;
};
