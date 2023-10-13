import { orgTags } from './tags';
import { HighlightStyle } from '@codemirror/language';
import { Tag, tags } from '@lezer/highlight';

const kebabIt = (str: string) =>
  str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

const highlightTagDefinitions = Object.entries(tags).filter(
  ([, val]) => typeof val !== 'function'
) as [string, Tag][];

export const orgHighlightStyle = HighlightStyle.define([
  ...Object.entries(orgTags).map(([key, tag]) => ({
    tag,
    class: `org-${kebabIt(key)}`,
  })),
  ...highlightTagDefinitions.map(([key, tag]) => ({
    tag,
    class: `cm-${kebabIt(key)}`,
  })),
]);
