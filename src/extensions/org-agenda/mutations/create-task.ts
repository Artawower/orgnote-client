import { format, parseISO } from 'date-fns';

export interface CreateTaskInput {
  title: string;
  body?: string;
  scheduledDate?: string;
  todoKeyword?: string;
  tags?: string[];
}

const DEFAULT_TODO_KEYWORD = 'TODO';

const getDayName = (isoDate: string): string => format(parseISO(isoDate), 'EEE');

const normalizeContent = (content: string): string => {
  const trimmed = content.trimEnd();
  return trimmed ? `${trimmed}\n` : '';
};

const buildTagsSuffix = (tags: string[] | undefined): string =>
  tags?.length ? ` :${tags.join(':')}:` : '';

const buildHeadlineLine = (input: CreateTaskInput): string => {
  const keyword = input.todoKeyword ?? DEFAULT_TODO_KEYWORD;
  const tags = buildTagsSuffix(input.tags);
  return `* ${keyword} ${input.title.trim()}${tags}\n`;
};

const buildScheduledLine = (date: string): string => `SCHEDULED: <${date} ${getDayName(date)}>\n`;

const buildPlanningBlock = (scheduledDate: string | undefined): string =>
  scheduledDate ? buildScheduledLine(scheduledDate) : '';

const buildBodyBlock = (body: string | undefined): string => (body ? `${body.trim()}\n` : '');

export const createTask = (content: string, input: CreateTaskInput): string => {
  const base = normalizeContent(content);
  const headline = buildHeadlineLine(input);
  const planning = buildPlanningBlock(input.scheduledDate);
  const body = buildBodyBlock(input.body);
  return `${base}${headline}${planning}${body}`;
};
