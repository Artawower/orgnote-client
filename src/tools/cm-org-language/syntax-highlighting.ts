import { HighlightStyle } from '@codemirror/language';

import { orgTags } from './tags';

export const orgHighlightStyle = HighlightStyle.define(
  Object.entries(orgTags).map(([key, tag]) => ({ tag, class: `org-${key}` }))
);
