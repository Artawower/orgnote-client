import { NodeType, type OrgNode } from 'org-mode-ast';

const DONE_STATE_LINE = /^- State "DONE" from "[^"]+" \[(\d{4}-\d{2}-\d{2})/;
const LOGBOOK_MARKER = ':LOGBOOK:';
const END_MARKER = ':END:';

interface LogbookBounds {
  start: number;
  end: number;
}

const nodeText = (node: OrgNode): string => (node.rawValue ?? node.value ?? '').trim();

const isPropertyMarker = (node: OrgNode, marker: string): boolean =>
  node.is(NodeType.Property) && nodeText(node).toUpperCase() === marker;

const findLogbookBounds = (section: OrgNode): LogbookBounds | undefined => {
  const logbook = section.childrenList.find((node) => isPropertyMarker(node, LOGBOOK_MARKER));
  if (!logbook) return undefined;
  const end = section.childrenList.find(
    (node) => node.start > logbook.start && isPropertyMarker(node, END_MARKER),
  );
  return end ? { start: logbook.end, end: end.start } : undefined;
};

const isInsideBounds = (node: OrgNode, bounds: LogbookBounds): boolean =>
  node.start >= bounds.start && node.end <= bounds.end;

const collectLogbookListItems = (node: OrgNode, bounds: LogbookBounds): OrgNode[] => {
  const nested = node.childrenList.flatMap((child) => collectLogbookListItems(child, bounds));
  return node.is(NodeType.ListItem) && isInsideBounds(node, bounds) ? [node, ...nested] : nested;
};

const extractDoneDate = (item: OrgNode): string | undefined =>
  DONE_STATE_LINE.exec(item.rawValue ?? '')?.[1];

export const extractDoneDates = (headline: OrgNode): string[] => {
  const section = headline.section;
  if (!section) return [];
  const bounds = findLogbookBounds(section);
  if (!bounds) return [];
  return collectLogbookListItems(section, bounds).flatMap((item) => {
    const date = extractDoneDate(item);
    return date ? [date] : [];
  });
};

export const extractLastDoneAt = (headline: OrgNode): string | undefined =>
  extractDoneDates(headline).sort().at(-1);
