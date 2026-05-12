import type { OrgNode } from 'org-mode-ast';

const habitStyleValue = 'habit';

/**
 * Returns true when the headline has `:STYLE: habit` in its PROPERTIES drawer.
 * Trims keys due to org-mode-ast property key whitespace quirk.
 */
export const isHabitHeadline = (node: OrgNode): boolean =>
  Object.entries(node.properties ?? {}).some(
    ([key, value]) => key.trim() === 'style' && value?.trim().toLowerCase() === habitStyleValue,
  );
