import { cmNodes } from './node-ids';
import { Tag, styleTags } from '@lezer/highlight';
import { tags as t } from '@lezer/highlight';
import { NodeType } from 'org-mode-ast';

const codeNodes = ['Identifier', 'Boolean', 'String', 'LineComment'] as const;

const orgStyledNodes = [
  NodeType.Bold,
  NodeType.Italic,
  NodeType.Crossed,
  NodeType.Title,
  NodeType.PropertyDrawer,
  NodeType.SrcBlock,
  NodeType.Keyword,
  NodeType.Comment,
  NodeType.Operator,
  NodeType.BlockProperty,
  NodeType.SrcLanguage,
  NodeType.Link,
  NodeType.LinkName,
  NodeType.LinkUrl,
  NodeType.InlineCode,
  NodeType.Verbatim,
  NodeType.Checkbox,
  NodeType.QuoteBlock,
  ...cmNodes,
] as const;

const orgFullStyledNodes = [...orgStyledNodes, ...codeNodes] as const;

type StyledNodes = typeof orgFullStyledNodes[number];

export const orgTags: { [key in StyledNodes]: Tag } = orgStyledNodes.reduce(
  (acc, cur) => {
    return { ...acc, [cur]: Tag.define() };
  },
  {} as { [key in StyledNodes]: Tag }
);

const defineNestedStyle = (styleName: string) => `${styleName}/...`;

const styleCodeLanguageNodes: { [key: string]: Tag } = {
  'Identifier/...': t.variableName,
  'Boolean/...': t.bool,
  'String/...': t.string,
  'LineComment/...': t.lineComment,
  'IfStatement/...': t.bool,
};

export const orgTagsStyles = styleTags(
  orgStyledNodes.reduce(
    (acc, curr) => ({
      ...acc,
      [defineNestedStyle(curr)]: orgTags[curr],
    }),
    { ...styleCodeLanguageNodes }
  )
);
