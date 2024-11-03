import { FileSystem } from 'orgnote-api';
import { useMobileFs } from 'src/file-system/mobile-fs';
import { useSimpleFs } from 'src/file-system/simple-fs';
import { platformSpecificValue } from 'src/tools/platform-specific-value.tool';

export function useFileSystem(): FileSystem {
  // TODO: pick file system from configs
  const currentFs = platformSpecificValue<FileSystem>({
    nativeMobile: useMobileFs(),
    mobile: useMobileFs(),
    desktop: useSimpleFs(),
  });

  return currentFs;
}
