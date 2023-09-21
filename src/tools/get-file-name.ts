export const getFileName = (path: string): string => {
  return path.split('/').pop();
};

export const getFileNameWithoutExtension = (path: string): string => {
  return getFileName(path).split('.').shift();
};
