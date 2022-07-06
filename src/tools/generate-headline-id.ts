import { OrgSrcBlock } from 'src/types/org';
import { OrgData } from 'uniorg';

export function generateHeadlineId(
  data:
    | OrgData
    | (OrgSrcBlock & {
        contentsBegin: number;
        contentsEnd: number;
      })
): string {
  if ((data as OrgSrcBlock).type === 'src-block') {
    return (data as OrgSrcBlock).id;
  }
  return `${data?.contentsBegin}_${data?.contentsEnd}`;
}
