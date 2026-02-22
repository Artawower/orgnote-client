import { buildBufferUri, splitPath, toAbsolutePath } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import type { ResultAsync } from 'neverthrow';
import { getFileDirPath } from './get-file-dir-path';

const idLinkPrefix = 'id:';
const defaultScheme = 'file';
const orgLocationSeparator = '::';
const pathSegmentSeparator = '/';

const schemePrefixPattern = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const relativeOrAbsoluteFileLinkPattern = /^(?:\.{1,2}\/|\/)/;

export type FileMetaGetter = (id: string) => Promise<{ filePath: string[] } | undefined>;

const stripOrgLocationSuffix = (rawLink: string): string => {
  const separatorIndex = rawLink.indexOf(orgLocationSeparator);
  if (separatorIndex === -1) {
    return rawLink;
  }

  return rawLink.slice(0, separatorIndex);
};

const normalizeAbsolutePath = (path: string): string =>
  toAbsolutePath(
    splitPath(path)
      .reduce<string[]>((acc, segment) => {
        if (segment === '.') {
          return acc;
        }

        if (segment === '..') {
          acc.pop();
          return acc;
        }

        acc.push(segment);
        return acc;
      }, [])
      .join(pathSegmentSeparator),
  );

export const isInternalLink = (rawLink: string): boolean =>
  rawLink.startsWith(idLinkPrefix) && rawLink.length > idLinkPrefix.length;

export const isRelativeFileLink = (rawLink: string): boolean => {
  const target = stripOrgLocationSuffix(rawLink);
  if (schemePrefixPattern.test(target)) {
    return false;
  }

  return relativeOrAbsoluteFileLinkPattern.test(target);
};

export const extractInternalId = (rawLink: string): string => {
  if (!isInternalLink(rawLink)) return '';
  return rawLink.slice(idLinkPrefix.length);
};

export const resolveRelativeOrgFilePath = (rawLink: string, currentFilePath: string): string => {
  const target = stripOrgLocationSuffix(rawLink);
  if (target.startsWith(pathSegmentSeparator)) {
    return normalizeAbsolutePath(target);
  }

  const basePath = getFileDirPath(currentFilePath);
  return normalizeAbsolutePath(`${basePath}${pathSegmentSeparator}${target}`);
};

export const resolveInternalNoteUri = (
  noteId: string,
  getFileMeta: FileMetaGetter,
): ResultAsync<string | undefined, Error> =>
  to(getFileMeta, `Failed to resolve note: ${noteId}`)(noteId).map((meta) => {
    if (!meta) return undefined;
    return buildBufferUri(defaultScheme, meta.filePath.join('/'));
  });
