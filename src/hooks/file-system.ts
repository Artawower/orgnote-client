import fs from 'indexeddb-fs';
import { platformSpecificValue } from 'src/tools/platform-specific-value.tool';

export function useFileSystem() {
  const currentFs = platformSpecificValue({
    mobile: fs,
    desktop: fs,
  });

  const normalizePath = (path: string | string[]): string => {
    if (Array.isArray(path)) {
      return path.join('/');
    }
    return path;
  };

  const readTextFile = async (path: string | string[]): Promise<string> => {
    return await currentFs.readFile(normalizePath(path));
  };

  const writeTextFile = async (path: string | string[], content: string) => {
    return await currentFs.writeFile(normalizePath(path), content);
  };

  return {
    readTextFile,
    writeTextFile,
  };
}
