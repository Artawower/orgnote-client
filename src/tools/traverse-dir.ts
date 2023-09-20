// TODO: master refactor. Use generators instead.
export function traverseDirectory(
  entry: FileSystemDirectoryEntry,
  acceptFileExtensions: string[] = [],
  ignoreDirs: string[] = ['.git', 'node_modules', 'dist', 'build']
): Promise<FileSystemFileEntry[]> {
  const reader = entry.createReader();
  return new Promise((resolve, reject) => {
    const iterationAttempts: Promise<FileSystemFileEntry[]>[] = [];
    function readEntries() {
      reader.readEntries(
        (entries) => {
          if (!entries.length) {
            // Done iterating this particular directory
            resolve(
              Promise.all(iterationAttempts).then((entries) => entries.flat(2))
            );
            return;
          }
          iterationAttempts.push(
            Promise.all(
              entries.map((ientry) => {
                const fileExt = ientry.name.split('.').pop();
                if (ientry.isFile && acceptFileExtensions.includes(fileExt)) {
                  return ientry;
                }
                if (ientry.isFile || ignoreDirs.includes(ientry.name)) {
                  return [];
                }
                return traverseDirectory(
                  ientry as FileSystemDirectoryEntry,
                  acceptFileExtensions,
                  ignoreDirs
                );
              })
            ) as Promise<FileSystemFileEntry[]>
          );
          readEntries();
        },
        (error) => reject(error)
      );
    }
    readEntries();
  });
}
