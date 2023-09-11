export const getFileName = (path: string): string => {
  return path.split('/').pop();
};
