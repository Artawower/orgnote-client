import { OrgNode } from 'org-mode-ast';
// import Quill from 'quill';

export const titleSize = '48px';

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

export const textSize = ['14px', '12px'];

export const formatHeadline = (content: OrgNode) => {
  return {
    size: headingSize[content?.level || headingSize.length - 1],
  };
};

// const formatKeyword = (content: Keyword) => {
// if ((content as Keyword).key === 'TITLE') {
//   return { size: titleSize };
// }
// };

// const formatConfigs: {
//   [key in OrgNode['type']]?: (arg0?: any) => unknown;
// } = {
// headline: formatHeadline,
// paragraph: () => ({ size: '20px', code: false, bold: false }),
// keyword: formatKeyword,
// bold: (content: Bold) => ({ bold: true }),
// verbatim: (content: Verbatim) => {
//   // console.log(content);
//   return { code: true };
// },
// 'src-block': () => {
//   return { 'code-block': true };
// },
// };

// TODO: master dirty hack cause has lack of some nodes position.
// interface PrettifyContext {
//   lastBeginPos: number;
//   lastEndPos: number;
// }

// const findFormatOffsetByContent = (content: OrgNode): [number, number] => {
// if (content.type === 'keyword' && content.key === 'TITLE') {
//   return [0, 9];
// }
// if (content.type === 'verbatim') {
//   return [0, 2];
// }
// if (content.type === 'src-block') {
//   const beginSrcLength = 12;
//   const endSrcLength = 9;
//   return [
//     beginSrcLength + (content as OrgSrcBlock).language.length + 1,
//     -endSrcLength,
//   ];
// }
// return [0, 0];
// };

/*
 *  Return start and end positions for formatting. Not all nodes have original coords
 *  https://github.com/rasendubi/uniorg/discussions/49
 */
// const getFormatPositions = (
//   content: OrgNode,
//   lastStartPosition = 0
// ): [number, number] => {
// if ((content as RecursiveObject).contentsBegin != null) {
//   return [
//     (content as RecursiveObject).contentsBegin,
//     (content as RecursiveObject).contentsEnd,
//   ];
// }
// if ((content as any).value) {
//   const [additionalStartOffset, additionalEndOffset] =
//     findFormatOffsetByContent(content);
//   return [
//     lastStartPosition + additionalStartOffset,
//     lastStartPosition + additionalStartOffset + (content as any).value.length,
//   ];
// }
// // TODO: master fix
// return [lastStartPosition, lastStartPosition];
// };

// export const prettifyEditorText = (
//   quill: Quill,
//   content: OrgNode,
//   context: PrettifyContext = { lastBeginPos: 0, lastEndPos: 0 }
// ): void => {
// const formatConfig = formatConfigs[content.type]?.(content);
// const [start, end] = getFormatPositions(content, context.lastBeginPos);
// // TODO: master some of nodes doesn't have own positions. Its the point to think about simple parser implementation
// const isNestedChildWithoutRange =
//   (content as RecursiveObject).contentsBegin == null;
// context.lastBeginPos = isNestedChildWithoutRange ? end : start;
// console.log(
//   '🦄: [line 42][quill-formatters.ts] [35mcontent: ',
//   content,
//   start,
//   end,
//   context.lastBeginPos
// );
// if (formatConfig) {
//   quill.formatText(start, end - start, formatConfig, 'api');
// }
// (content as RecursiveObject).children?.forEach((c) =>
//   prettifyEditorText(quill, c, context)
// );
// };
