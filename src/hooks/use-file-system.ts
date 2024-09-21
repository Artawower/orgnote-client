import { FileSystem } from 'orgnote-api';
import { browserFs } from 'src/file-system/browser-fs';
import { mobileFs } from 'src/file-system/mobile-fs';
import { platformSpecificValue } from 'src/tools/platform-specific-value.tool';

export function useFileSystem(): FileSystem {
  const currentFs = platformSpecificValue<FileSystem>({
    mobile: mobileFs,
    desktop: browserFs,
  });

  return currentFs;
}
