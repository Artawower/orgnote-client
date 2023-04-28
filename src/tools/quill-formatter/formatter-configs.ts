import { NodeType, OrgNode } from 'org-mode-ast';

export const titleSize = '48px';

const formatKeyword = (orgNode: OrgNode) => {
  // if ((content as Keyword).key === 'TITLE') {
  //   return { size: titleSize };
  // }
};

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

export const formatHeadline = (orgNode: OrgNode) => {
  return {
    size: headingSize[orgNode?.level || headingSize.length - 1],
  };
};

export const formatConfigs: {
  [key in NodeType]?: (arg0?: OrgNode) => unknown;
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
};

export function getFormatConfig(orgNode: OrgNode): any {
  return formatConfigs[orgNode.type]?.(orgNode);
}
