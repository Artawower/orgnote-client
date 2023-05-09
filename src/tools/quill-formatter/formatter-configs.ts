import { NodeType, OrgNode } from 'org-mode-ast';

interface FormatConfigParams {
  orgNode: OrgNode;
  specialSymbolsHidden?: boolean;
}

export const titleSize = '48px';

export const textSize = ['20px', '14px', '12px'];

export const headingSize = [
  titleSize,
  '36px',
  '32px',
  '28px',
  '26px',
  '24px',
  '22px',
  '20px',
  '18px',
];

const formatKeyword = ({ orgNode }: FormatConfigParams) => {
  if (orgNode.children.get(0).value?.toLowerCase() === '#+title:')
    return {
      headline: {
        level: 1,
      },
    };
};

export const formatHeadline = ({ orgNode }: FormatConfigParams) => {
  return {
    headline: {
      level: orgNode.level,
    },
  };
};

export const formatConfigs: {
  [key in NodeType]?: (params: FormatConfigParams) => unknown;
} = {
  headline: formatHeadline,
  keyword: formatKeyword,
  bold: () => ({ bold: true }),
  crossed: () => ({ strike: true }),
  italic: () => ({ italic: true }),
  // text: () => ({ size: textSize[0], italic: false, bold: false }),
  linkName: ({ orgNode }) => ({ link: { orgNode } }),
  blockBody: ({ orgNode }) => {
    if (orgNode.parent.is(NodeType.SrcBlock)) {
      return { 'code-block': true };
    }
  },
  linkUrl: ({ specialSymbolsHidden, orgNode }) => {
    if (orgNode.parent.children.length === 3) {
      return { link: { orgNode } };
    }
    return specialSymbolsHidden && { invisible: true };
  },
  inlineCode: () => {
    return { code: true };
  },
  verbatim: () => {
    return { code: true };
  },
  operator: ({ specialSymbolsHidden }) => {
    if (specialSymbolsHidden) {
      return { invisible: true };
    }
  },
};

export function getFormatConfig(
  orgNode: OrgNode,
  specialSymbolsHidden: boolean
): any {
  return formatConfigs[orgNode.type]?.({ orgNode, specialSymbolsHidden });
}
