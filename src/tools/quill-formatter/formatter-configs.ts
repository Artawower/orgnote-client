import { NodeType, OrgNode } from 'org-mode-ast';

interface FormatConfigParams {
  orgNode: OrgNode;
  specialSymbolsHidden?: boolean;
}

export const titleSize = '48px';

export const textSize = ['14px', '12px'];

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
  // if ((content as Keyword).key === 'TITLE') {
  //   return { size: titleSize };
  // }
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
  text: () => ({ size: textSize[0] }),
  italic: () => ({ italic: true }),
  link: () => ({ link: true }),
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
