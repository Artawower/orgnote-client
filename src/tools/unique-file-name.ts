import { FileTree } from 'src/repositories';

export const getUniqueFileName = (
  children: FileTree,
  fileExt = '.org'
): string => {
  const notePrefix = 'Untitled-note';
  let initialName = notePrefix;

  let inc = 0;
  while (children?.[`${initialName}${fileExt}`]) {
    inc++;
    initialName = `${notePrefix}-${inc}`;
  }

  return initialName;
};
