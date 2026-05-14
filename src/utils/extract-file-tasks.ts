import type { FileMeta } from 'orgnote-api';
import { NodeType, type OrgNode, type Heading } from 'org-mode-ast';
import { logger } from 'src/boot/logger';
import { isHabitHeadline } from './headline-extractors';
import { extractDoneDates, extractLastDoneAt } from './extract-logbook-last-done';

type FileTask = NonNullable<FileMeta['tasks']>[number];
type ExtractedFileTask = FileTask & { line: number };
type FileTaskState = FileTask['state'];
type OffsetToLineResolver = (offset: number) => number;
type HeadingsByStart = Map<number, Heading>;

const doneTodoKeyword = 'DONE';
const todoState: FileTaskState = 'todo';
const doneState: FileTaskState = 'done';

const getTitleChildren = (node: OrgNode): OrgNode[] => node.title?.childrenList ?? [];

const findTitleChild = (node: OrgNode, type: NodeType): OrgNode | undefined =>
  getTitleChildren(node).find((child) => child.is(type));

const resolveCheckboxState = (checkboxNode: OrgNode): FileTaskState =>
  checkboxNode.checked ? doneState : todoState;

const resolveTodoState = (todoKeywordNode: OrgNode): FileTaskState => {
  const keyword = todoKeywordNode.value?.trim().toUpperCase() ?? '';
  return keyword === doneTodoKeyword ? doneState : todoState;
};

const extractTaskText = (node: OrgNode): string =>
  getTitleChildren(node)
    .filter(
      (child) =>
        child.isNot(NodeType.Operator) &&
        child.isNot(NodeType.Checkbox) &&
        child.isNot(NodeType.TodoKeyword) &&
        child.isNot(NodeType.Priority) &&
        child.isNot(NodeType.TagList) &&
        child.isNot(NodeType.NewLine),
    )
    .map((child) => child.rawValue ?? child.value ?? '')
    .join('')
    .trim();

const buildTaskId = (filePath: string, node: OrgNode, kind: FileTask['kind']): string =>
  `${filePath}|${kind}|${node.start}|${node.end}`;

const findLineFromOffsets = (offsets: number[], offset: number): number => {
  let left = 0;
  let right = offsets.length - 1;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const next = offsets[middle + 1] ?? Number.POSITIVE_INFINITY;
    const current = offsets[middle] ?? 0;
    if (offset >= current && offset < next) return middle + 1;
    if (offset < current) right = middle - 1;
    else left = middle + 1;
  }
  return offsets.length;
};

const createOffsetToLineResolver = (content: string): OffsetToLineResolver => {
  const offsets = [0];
  for (let index = 0; index < content.length; index++) {
    if (content[index] === '\n') offsets.push(index + 1);
  }
  return (offset: number): number => findLineFromOffsets(offsets, offset);
};

const logExtractedTask = <T extends ExtractedFileTask>(task: T): T => {
  logger.debug('[agenda] extracted task', {
    start: task.start,
    text: task.text,
    state: task.state,
    lastDoneAt: task.lastDoneAt,
    doneDates: task.doneDates,
    hasRepeater: !!task.scheduled?.repeater,
  });
  return task;
};

const buildAgendaFields = (node: OrgNode, heading: Heading | undefined): Partial<FileTask> => ({
  priority: heading?.priority,
  tags: heading?.tags,
  todoKeyword: heading?.todoKeyword,
  scheduled: heading?.scheduled,
  deadline: heading?.deadline,
  closed: heading?.closed,
  clocks: heading?.clocks,
  lastDoneAt: extractLastDoneAt(node),
  doneDates: extractDoneDates(node),
  isHabit: isHabitHeadline(node) || undefined,
});

const createHeadlineTask = (
  node: OrgNode,
  filePath: string,
  resolveLine: OffsetToLineResolver,
  kind: Extract<FileTask['kind'], 'headline-checkbox' | 'headline-todo'>,
  state: FileTaskState,
  agendaFields: Partial<FileTask>,
): ExtractedFileTask =>
  logExtractedTask({
    id: buildTaskId(filePath, node, kind),
    kind,
    state,
    text: extractTaskText(node),
    start: node.start,
    end: node.end,
    line: resolveLine(node.start),
    ...agendaFields,
  });

const createTaskFromHeadline = (
  node: OrgNode,
  filePath: string,
  resolveLine: OffsetToLineResolver,
  headingsByStart: HeadingsByStart,
): ExtractedFileTask | undefined => {
  const agendaFields = buildAgendaFields(node, headingsByStart.get(node.start));
  const checkboxNode = findTitleChild(node, NodeType.Checkbox);
  if (checkboxNode) {
    return createHeadlineTask(
      node,
      filePath,
      resolveLine,
      'headline-checkbox',
      resolveCheckboxState(checkboxNode),
      agendaFields,
    );
  }
  const todoKeywordNode = findTitleChild(node, NodeType.TodoKeyword);
  if (!todoKeywordNode) return undefined;
  return createHeadlineTask(
    node,
    filePath,
    resolveLine,
    'headline-todo',
    resolveTodoState(todoKeywordNode),
    agendaFields,
  );
};

const createTaskFromListItem = (
  node: OrgNode,
  filePath: string,
  resolveLine: OffsetToLineResolver,
): ExtractedFileTask | undefined => {
  const checkboxNode = findTitleChild(node, NodeType.Checkbox);
  if (!checkboxNode) return undefined;
  return logExtractedTask({
    id: buildTaskId(filePath, node, 'list-checkbox'),
    kind: 'list-checkbox',
    state: resolveCheckboxState(checkboxNode),
    text: extractTaskText(node),
    start: node.start,
    end: node.end,
    line: resolveLine(node.start),
  });
};

const createTaskFromNode = (
  node: OrgNode,
  filePath: string,
  resolveLine: OffsetToLineResolver,
  headingsByStart: HeadingsByStart,
): ExtractedFileTask | undefined => {
  if (node.is(NodeType.Headline)) {
    return createTaskFromHeadline(node, filePath, resolveLine, headingsByStart);
  }
  if (node.is(NodeType.ListItem)) {
    return createTaskFromListItem(node, filePath, resolveLine);
  }
  return undefined;
};

const getNestedNodes = (node: OrgNode): OrgNode[] => {
  const directNodes = [node.title, node.section].filter(
    (value): value is OrgNode => value !== undefined,
  );
  return [...directNodes, ...node.childrenList];
};

const collectTasks = (
  node: OrgNode,
  filePath: string,
  resolveLine: OffsetToLineResolver,
  headingsByStart: HeadingsByStart,
): ExtractedFileTask[] => {
  const nodeTask = createTaskFromNode(node, filePath, resolveLine, headingsByStart);
  const nestedTasks = getNestedNodes(node).flatMap((child) =>
    collectTasks(child, filePath, resolveLine, headingsByStart),
  );
  return nodeTask ? [nodeTask, ...nestedTasks] : nestedTasks;
};

const buildHeadingsByStart = (root: OrgNode): HeadingsByStart =>
  new Map((root.meta?.headings ?? []).map((h: Heading) => [h.start, h]));

export const extractFileTasks = (root: OrgNode, filePath: string): ExtractedFileTask[] => {
  const resolveLine = createOffsetToLineResolver(root.rawValue);
  const headingsByStart = buildHeadingsByStart(root);
  return collectTasks(root, filePath, resolveLine, headingsByStart);
};
