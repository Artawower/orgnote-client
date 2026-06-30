import type { EditorView } from '@codemirror/view';
import type { OrgNode } from 'org-mode-ast';
import { NodeType } from 'org-mode-ast';
import type { OrgPropertyEntry } from 'orgnote-api';
import { selectOrgDocument } from 'orgnote-api/utils';
import type { PropertyEditorState, PropertyScope } from './property-model';

const PROPERTY_VALUE_LINE_BREAK_PATTERN = /\s*\r?\n\s*/g;

const normalizePropertyValue = (value: string): string =>
  value.replace(PROPERTY_VALUE_LINE_BREAK_PATTERN, ' ').trim();

const formatPropertyLine = ({ key, value }: OrgPropertyEntry): string => {
  const normalizedValue = normalizePropertyValue(value);
  return normalizedValue ? `:${key}: ${normalizedValue}` : `:${key}:`;
};

const formatPropertyDrawer = (items: readonly OrgPropertyEntry[]): string =>
  [PROPERTY_HEAD, ...items.map(formatPropertyLine), PROPERTY_END].join('\n');

const PROPERTY_HEAD = ':PROPERTIES:';
const PROPERTY_END = ':END:';

const RAW_DRAWER_PROPERTY_LINE_FALLBACK_PATTERN = /^:([^:\s]+):\s*(.*)$/;

const documentText = (view: EditorView): string => view.state.doc.toString();

const lineEndAt = (content: string, position: number): number => {
  const nextLineBreak = content.indexOf('\n', position);
  return nextLineBreak === -1 ? content.length : nextLineBreak;
};

const findCurrentDrawerEnd = (content: string, from: number): number | undefined => {
  for (let position = from; position < content.length; position = lineEndAt(content, position) + 1) {
    const lineEnd = lineEndAt(content, position);
    if (content.slice(position, lineEnd).trim() === PROPERTY_END) return lineEnd;
  }

  return undefined;
};

export const resolveCurrentPropertyRange = (content: string, node: OrgNode): { from: number; to: number } => {
  const staleRange = getPropertyWidgetRange(node);
  const currentEnd = findCurrentDrawerEnd(content, staleRange.from);
  if (currentEnd === undefined) return staleRange;
  return { from: staleRange.from, to: currentEnd };
};

export const replacePropertyItems = (
  view: EditorView,
  node: OrgNode,
  items: readonly OrgPropertyEntry[],
  onApplied?: () => void,
): void => {
  const content = documentText(view);
  const range = resolveCurrentPropertyRange(content, node);
  const insert = formatPropertyDrawer(items);
  const docLength = view.state.doc.length;
  if (range.from > docLength) return;
  const cursorPosition = view.state.selection.main.head;
  const changes = { from: range.from, to: Math.min(range.to, docLength), insert };
  view.dispatch({
    changes,
    selection: { anchor: view.state.changes(changes).mapPos(cursorPosition) },
  });
  onApplied?.();
};

const readPropertiesState = (
  content: string,
  scope: PropertyScope,
  anchor: number,
  stateId: string,
): PropertyEditorState => {
  const items = selectOrgDocument(content, (doc) => {
    const properties = scope === 'page' ? doc.properties : doc.headlineAt(anchor)?.properties;
    return properties?.items ?? [];
  });
  return { scope, stateId, items };
};

const normalizeEntries = (items: readonly OrgPropertyEntry[]): OrgPropertyEntry[] => {
  const byKey = new Map<string, OrgPropertyEntry>();
  items.forEach((item) => {
    const key = item.key.toLowerCase();
    byKey.delete(key);
    byKey.set(key, item);
  });
  return [...byKey.values()];
};

const readPropertyItemsFromRawDrawerFallback = (
  content: string,
  range: { from: number; to: number },
): OrgPropertyEntry[] =>
  normalizeEntries(
    content
      .slice(range.from, range.to)
      .split(/\r?\n/)
      .flatMap((line) => {
        const match = line.match(RAW_DRAWER_PROPERTY_LINE_FALLBACK_PATTERN);
        if (!match) return [];
        const [, key, value] = match;
        if (!key || key === 'PROPERTIES' || key === 'END') return [];
        return [{ key, value: value?.trim() ?? '' }];
      }),
  );

export const getPropertyEditorState = (
  view: EditorView,
  scope: PropertyScope,
  anchor: number,
  stateId: string,
  node?: OrgNode,
): PropertyEditorState => {
  const content = documentText(view);
  const apiState = readPropertiesState(content, scope, anchor, stateId);
  if (apiState.items.length > 0) return apiState;
  const rangeItems = node
    ? readPropertyItemsFromRawDrawerFallback(content, getPropertyWidgetRange(node))
    : [];
  return { scope, stateId, items: rangeItems };
};

export const insertEmptyPropertyDrawer = (view: EditorView, position: number): void => {
  const insert = `${formatPropertyDrawer([])}\n`;
  const safePosition = Math.min(position, view.state.doc.length);
  view.dispatch({
    changes: { from: safePosition, to: safePosition, insert },
    selection: { anchor: safePosition },
  });
};

const nodeText = (node: OrgNode): string => node.rawValue.trim();

const isRootPropertyStart = (node: OrgNode): boolean =>
  node.is(NodeType.Property) &&
  nodeText(node) === PROPERTY_HEAD &&
  Boolean(node.parent?.is(NodeType.Root));

const firstHeadlineStart = (root: OrgNode): number =>
  root.childrenList.find((child) => child.is(NodeType.Headline))?.start ?? Number.POSITIVE_INFINITY;

export const isRootPropertySequenceStart = (node: OrgNode): boolean => {
  const root = isRootPropertyStart(node) ? node.parent : undefined;
  return Boolean(root && node.start < firstHeadlineStart(root));
};

const findRootSequenceEnd = (node: OrgNode): OrgNode | undefined => {
  const root = node.parent;
  if (!root) return undefined;
  const headlineStart = firstHeadlineStart(root);
  return root.childrenList.find(
    (child) => child.start > node.start && child.start < headlineStart && nodeText(child) === PROPERTY_END,
  );
};

export const getPropertyWidgetRange = (node: OrgNode): { from: number; to: number } => {
  if (node.is(NodeType.PropertyDrawer)) return { from: node.start, to: node.end };
  const end = findRootSequenceEnd(node);
  return { from: node.start, to: end?.end ?? node.end };
};

export const getPropertyEditPosition = (node: OrgNode, docLength: number): number =>
  Math.min(getPropertyWidgetRange(node).to, docLength);

export const getPropertyScope = (node: OrgNode): PropertyScope =>
  node.parent?.is(NodeType.Section) ? 'headline' : 'page';

export const getPropertyStateKey = (node: OrgNode): string => {
  const scope = getPropertyScope(node);
  return `${scope}:${node.start}`;
};

