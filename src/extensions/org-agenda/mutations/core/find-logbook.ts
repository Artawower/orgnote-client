import { NodeType } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';

const LOGBOOK_MARKER = ':LOGBOOK:';
const END_MARKER = ':END:';

export interface LogbookInsertPoint {
  insertAt: number;
  shouldCreateDrawer: boolean;
}

const findLineEnd = (content: string, start: number): number => {
  const lineEnd = content.indexOf('\n', start);
  return lineEnd === -1 ? content.length : lineEnd + 1;
};

const findPlanningInsertAt = (section: OrgNode, content: string): number | undefined => {
  const planning = section.childrenList.find((node) => node.is(NodeType.Planning));
  if (!planning) return undefined;
  return findLineEnd(content, planning.end);
};

const findExistingLogbookInsertAt = (section: OrgNode, content: string): number | undefined => {
  const logbookStart = content.indexOf(LOGBOOK_MARKER, section.start);
  const logbookEnd = content.indexOf(END_MARKER, logbookStart);
  if (logbookStart === -1 || logbookStart >= section.end) return undefined;
  if (logbookEnd === -1 || logbookEnd >= section.end) return undefined;
  return findLineEnd(content, logbookStart);
};

export const findLogbookInsertPoint = (section: OrgNode, content: string): LogbookInsertPoint => {
  const existingInsertAt = findExistingLogbookInsertAt(section, content);
  if (existingInsertAt !== undefined) {
    return { insertAt: existingInsertAt, shouldCreateDrawer: false };
  }
  return {
    insertAt: findPlanningInsertAt(section, content) ?? section.start,
    shouldCreateDrawer: true,
  };
};

export const wrapLogbookEntry = (entry: string): string =>
  `${LOGBOOK_MARKER}\n${entry}${END_MARKER}\n`;
