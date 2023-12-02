import { ORGNOTE_SCHEMA } from 'src/constants';

export function getMobileAppUrl(relativePath = ''): string {
  return `${ORGNOTE_SCHEMA}${relativePath}`;
}
