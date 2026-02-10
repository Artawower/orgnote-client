import { buildBufferUri } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import type { ResultAsync } from 'neverthrow';

const ID_LINK_PREFIX = 'id:';
const DEFAULT_SCHEME = 'file';

export type FileMetaGetter = (id: string) => Promise<{ filePath: string[] } | undefined>;

export const isInternalLink = (rawLink: string): boolean =>
  rawLink.startsWith(ID_LINK_PREFIX) && rawLink.length > ID_LINK_PREFIX.length;

export const extractInternalId = (rawLink: string): string => {
  if (!isInternalLink(rawLink)) return '';
  return rawLink.slice(ID_LINK_PREFIX.length);
};

export const resolveInternalNoteUri = (
  noteId: string,
  getFileMeta: FileMetaGetter,
): ResultAsync<string | undefined, Error> =>
  to(getFileMeta, `Failed to resolve note: ${noteId}`)(noteId).map((meta) => {
    if (!meta) return undefined;
    return buildBufferUri(DEFAULT_SCHEME, meta.filePath.join('/'));
  });
