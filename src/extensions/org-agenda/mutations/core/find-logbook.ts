import { NodeType } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';

const LOGBOOK_MARKER = ':LOGBOOK:';
const END_MARKER = ':END:';

export interface LogbookInsertPoint {
  insertAt: number;
  shouldCreateDrawer: boolean;
}

export interface ExistingLogbook {
  start: number;
  end: number;
  contentStart: number;
  contentEnd: number;
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

export const findExistingLogbook = (
  section: OrgNode,
  content: string,
): ExistingLogbook | undefined => {
  const logbookStart = content.indexOf(LOGBOOK_MARKER, section.start);
  const logbookEnd = content.indexOf(END_MARKER, logbookStart);
  if (logbookStart === -1 || logbookStart >= section.end) return undefined;
  if (logbookEnd === -1 || logbookEnd >= section.end) return undefined;
  return {
    start: logbookStart,
    end: findLineEnd(content, logbookEnd),
    contentStart: findLineEnd(content, logbookStart),
    contentEnd: logbookEnd,
  };
};

export const findLogbookInsertPoint = (section: OrgNode, content: string): LogbookInsertPoint => {
  const existingLogbook = findExistingLogbook(section, content);
  if (existingLogbook) {
    return { insertAt: existingLogbook.contentStart, shouldCreateDrawer: false };
  }
  return {
    insertAt: findPlanningInsertAt(section, content) ?? section.start,
    shouldCreateDrawer: true,
  };
};

export const wrapLogbookEntry = (entry: string): string =>
  `${LOGBOOK_MARKER}\n${entry}${END_MARKER}\n`;
