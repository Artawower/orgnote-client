import type { OrgNode } from 'org-mode-ast';

const habitStyleValue = 'habit';

export const isHabitHeadline = (node: OrgNode): boolean =>
  Object.entries(node.properties ?? {}).some(
    ([key, value]) => key.trim() === 'style' && value?.trim().toLowerCase() === habitStyleValue,
  );
