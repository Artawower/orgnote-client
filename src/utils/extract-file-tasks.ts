import type { FileMeta } from 'orgnote-api';
import { NodeType, type OrgNode } from 'org-mode-ast';

type FileTask = NonNullable<FileMeta['tasks']>[number];
type FileTaskState = FileTask['state'];

const doneTodoKeyword = 'DONE';
const todoState: FileTaskState = 'todo';
const doneState: FileTaskState = 'done';

const getTitleChildren = (node: OrgNode): OrgNode[] => {
  if (!node.title) {
    return [];
  }

  return node.title.childrenList;
};

const findTitleChild = (node: OrgNode, type: NodeType): OrgNode | undefined =>
  getTitleChildren(node).find((child) => child.is(type));

const resolveCheckboxState = (checkboxNode: OrgNode): FileTaskState => {
  if (checkboxNode.checked) {
    return doneState;
  }
  return todoState;
};

const resolveTodoState = (todoKeywordNode: OrgNode): FileTaskState => {
  const todoKeyword = todoKeywordNode.value?.trim().toUpperCase() ?? '';
  if (todoKeyword === doneTodoKeyword) {
    return doneState;
  }
  return todoState;
};

const extractTaskText = (node: OrgNode): string =>
  getTitleChildren(node)
    .filter(
      (child) =>
        child.isNot(NodeType.Operator) &&
        child.isNot(NodeType.Checkbox) &&
        child.isNot(NodeType.TodoKeyword) &&
        child.isNot(NodeType.NewLine),
    )
    .map((child) => child.rawValue ?? child.value ?? '')
    .join('')
    .trim();

const buildTaskId = (filePath: string, node: OrgNode, kind: FileTask['kind']): string =>
  `${filePath}|${kind}|${node.start}|${node.end}`;

const createTaskFromHeadline = (
  node: OrgNode,
  filePath: string,
): FileTask | undefined => {
  const checkboxNode = findTitleChild(node, NodeType.Checkbox);
  if (checkboxNode) {
    return {
      id: buildTaskId(filePath, node, 'headline-checkbox'),
      kind: 'headline-checkbox',
      state: resolveCheckboxState(checkboxNode),
      text: extractTaskText(node),
      start: node.start,
      end: node.end,
    };
  }

  const todoKeywordNode = findTitleChild(node, NodeType.TodoKeyword);
  if (!todoKeywordNode) {
    return undefined;
  }

  return {
    id: buildTaskId(filePath, node, 'headline-todo'),
    kind: 'headline-todo',
    state: resolveTodoState(todoKeywordNode),
    text: extractTaskText(node),
    start: node.start,
    end: node.end,
  };
};

const createTaskFromListItem = (
  node: OrgNode,
  filePath: string,
): FileTask | undefined => {
  const checkboxNode = findTitleChild(node, NodeType.Checkbox);
  if (!checkboxNode) {
    return undefined;
  }
  const kind: FileTask['kind'] = 'list-checkbox';

  return {
    id: buildTaskId(filePath, node, kind),
    kind,
    state: resolveCheckboxState(checkboxNode),
    text: extractTaskText(node),
    start: node.start,
    end: node.end,
  };
};

const createTaskFromNode = (
  node: OrgNode,
  filePath: string,
): FileTask | undefined => {
  if (node.is(NodeType.Headline)) {
    return createTaskFromHeadline(node, filePath);
  }

  if (node.is(NodeType.ListItem)) {
    return createTaskFromListItem(node, filePath);
  }

  return undefined;
};

const getNestedNodes = (node: OrgNode): OrgNode[] => {
  const directNodes = [node.title, node.section].filter((value): value is OrgNode => value !== undefined);
  return [...directNodes, ...node.childrenList];
};

const collectTasks = (
  node: OrgNode,
  filePath: string,
): FileTask[] => {
  const nodeTask = createTaskFromNode(node, filePath);
  const nestedTasks = getNestedNodes(node).flatMap((child) => collectTasks(child, filePath));

  if (!nodeTask) {
    return nestedTasks;
  }

  return [nodeTask, ...nestedTasks];
};

export const extractFileTasks = (root: OrgNode, filePath: string): FileTask[] => {
  return collectTasks(root, filePath);
};
