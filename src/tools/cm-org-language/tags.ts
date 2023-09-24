import { Tag, styleTags } from '@lezer/highlight';
import { NodeType } from 'org-mode-ast';

const styledNodes = [
  NodeType.Bold,
  NodeType.Italic,
  NodeType.Crossed,
  NodeType.Title,
  NodeType.PropertyDrawer,
] as const;

type StyledNodes = typeof styledNodes[number];

export const orgTags: { [key in StyledNodes]: Tag } = styledNodes.reduce(
  (acc, cur) => {
    return { ...acc, [cur]: Tag.define() };
  },
  {} as { [key in StyledNodes]: Tag }
);

const defineNestedStyle = (styleName: string) => `${styleName}/...`;

export const orgTagsStyles = styleTags(
  styledNodes.reduce(
    (acc, curr) => ({
      ...acc,
      [defineNestedStyle(curr)]: orgTags[curr],
    }),
    {}
  )
);
