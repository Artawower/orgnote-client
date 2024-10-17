import { FileSystem } from 'orgnote-api';
import { useBrowserFs } from 'src/file-system/browser-fs';
import { useMobileFs } from 'src/file-system/mobile-fs';
import { platformSpecificValue } from 'src/tools/platform-specific-value.tool';

export function useFileSystem(): FileSystem {
  // TODO: pick file system from configs
  const currentFs = platformSpecificValue<FileSystem>({
    mobile: useMobileFs(),
    desktop: useBrowserFs(),
  });

  return currentFs;
}
